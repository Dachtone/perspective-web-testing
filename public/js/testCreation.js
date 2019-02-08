var notifications = document.getElementById("notifications");
var questions = Array.from(document.getElementsByClassName("question"));

var sendBtn = document.getElementById("sendTest");
sendBtn.addEventListener("click", () => {
    var data = { head: {}, questions: [] };

    data.head.headline = document.getElementById("testInfo").children.testHead.headline.value;
    data.head.topic = document.getElementById("testInfo").children.testHead.topic.value;

    questions.forEach((question) => {
        data.questions.push({ body: question.children.testQuestion["body"].value, answer: question.children.testQuestion["answer"].value });
    });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/create_test", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if (!json.success)
                notifications.innerHTML = "<b>" + json.error + ".</b>";
            else
                window.location.replace("/tests?success=true");
        }
    };
    xhr.send(JSON.stringify(data));
});

var addBtn = document.getElementById("addQuestion");
addBtn.children.addBtn.addEventListener("click", () => {
    var lastQuestion = questions[questions.length - 1].children.testQuestion;
    if (lastQuestion["body"].value.trim().length === 0 || lastQuestion["answer"].value.trim().length === 0) {
        notifications.innerHTML = "<b>Введите предыдущий вопрос, прежде чем добавлять новый.</b>";
    }
    else {
        var newQuestion = document.createElement("div");
        newQuestion.setAttribute("class", "question");
        newQuestion.setAttribute("id", "question" + (questions.length + 1));
        newQuestion.innerHTML = `
            <form name="testQuestion">
                <textarea name="body" rows="5" cols="25" placeholder="Вопрос №` + (questions.length + 1) + `"></textarea><br>
                <br>
                <input name="answer" placeholder="Правильный ответ"><br>
                <br>
                <button type="button" name="deleteQuestionBtn">Удалить вопрос</button>
            </form>
            <hr>
        `;
        document.body.insertBefore(newQuestion, addBtn);
        questions.push(newQuestion);

        newQuestion.children.testQuestion["deleteQuestionBtn"].addEventListener("click", (event) => {
            var questionToDelete = event.target.parentNode.parentNode;
            var index = questions.indexOf(questionToDelete);
            if (index !== -1) {
                questions.splice(index, 1);
                for (var i = index; i < questions.length; i++) {
                    questions[i].setAttribute("id", "question" + (i + 1));
                    questions[i].children.testQuestion["body"].placeholder = "Вопрос №" + (i + 1);
                }
            }

            questionToDelete.remove();
        });

        notifications.innerHTML = "";
    }
});