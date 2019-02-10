var notifications = document.getElementById("notifications");
var questions = Array.from(document.getElementsByClassName("question"));
var container = document.getElementById("questionsContainer");

var mainContainer = document.getElementById("mainContainer");
var originalHeight = mainContainer.scrollHeight;

var sendBtn = document.getElementById("sendTest");
sendBtn.addEventListener("click", () => {
    var data = { head: {}, questions: [] };

    data.head.headline = document.getElementById("testInfo").children.dh1.children.dh2.children.dh3.children.headline.value.trim();
    data.head.topic = document.getElementById("testInfo").children.dt.children.topic.value;

    questions.forEach((question) => {
        data.questions.push({
            body: question.children.question_div.children.qd2.children.qdb.children.body.innerText.trim(),
            answer: question.children.question_div.children.qd2.children.qda1.children.qda2.children.qda3.children.answer.value.trim()
        });
    });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/create_test", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if (!json.success)
                addNotification(json.error + '.');
            else
                window.location.replace("/tests?success=true");
        }
    };
    xhr.send(JSON.stringify(data));
});

var addBtn = document.getElementById("addQuestion");
addBtn.addEventListener("click", () => {
    var lastQuestion = questions[questions.length - 1].children.question_div.children.qd2.children;
    if (lastQuestion.qdb.children.body.innerText.trim().length === 0 ||
        lastQuestion.qda1.children.qda2.children.qda3.children.answer.value.trim().length === 0) {
        addNotification("Введите предыдущий вопрос, прежде чем добавлять новый.");
    }
    else {
        var newQuestion = document.createElement("div");
        newQuestion.setAttribute("class", "uQgwAaVCKa_id item jsxJ question");
        newQuestion.setAttribute("id", "question" + (questions.length + 1));
        newQuestion.innerHTML = `
            <iron-icon name="delBtn">
                <svg id="deleteQuestionBtn" xmlns="http://www.w3.org/2000/svg" fill="#424242" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    <path d="M0 0h24v24H0z" fill="none"></path>
                </svg>
            </iron-icon>

            <div class="JNpaRszs" name="question_div">
                <div class="EoSh8tHys" name="question_label">Вопрос №` + (questions.length + 1) + `</div>
                <div class="B5QX5e8zoee" name="qd2">
                    <div class="XkgH40QICd" name="qdb">
                        <div class="id" contenteditable="true" aria-autocomplete="none" name="body"></div>
                    </div>
                    <div class="RVUsJwdjs" name="qda1">
                        <div class="QqMJzpve tlsa" name="qda2">
                            <span class="question_label">Правильный ответ: </span>
                            <div class="fVX" name="qda3">
                                <input type="text" name="answer">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(newQuestion);
        questions.push(newQuestion);

        // Scroll page to the bottom
        mainContainer.scrollTo({ top: mainContainer.scrollHeight, behavior: 'smooth' });

        var delBtn = newQuestion.children.delBtn.children.deleteQuestionBtn
        delBtn.addEventListener("click", (event) => {
            var questionToDelete = delBtn.parentNode.parentNode;

            questionToDelete.className += " deleting_animation";
            questionToDelete.addEventListener("transitionend", (event) => {
                var index = questions.indexOf(questionToDelete);
                if (index !== -1) {
                    questions.splice(index, 1);
                    for (var i = index; i < questions.length; i++) {
                        questions[i].setAttribute("id", "question" + (i + 1));
                        questions[i].children.question_div.children.question_label.innerHTML = "Вопрос №" + (i + 1);
                    }
                }

                questionToDelete.remove();
            });
        });
    }
});

var addNotification = (text) => {
    var notification = document.createElement("div");
    notification.setAttribute("class", "alert alert-danger alert-dismissible fade show mt-3 alert_animated");
    notification.innerHTML = text + `
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    notifications.appendChild(notification);

    // Scroll page to the top
    mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
};