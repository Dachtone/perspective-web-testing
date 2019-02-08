var notifications = document.getElementById("notifications");
var questions = Array.from(document.getElementsByClassName("question"));

var sendBtn = document.getElementById("sendTest");
if (sendBtn !== null) {
    sendBtn.addEventListener("click", () => {
        var data = [];

        questions.forEach((question) => {
            data.push({ answer: question.children.answer.value, filled: question.children.answer.value.length > 0 });
        });

        var id;
        var parts = location.pathname.split('/');
        if (location.pathname[location.pathname.length - 1] === '/' || (location.pathname[location.pathname.length - 1] === '?' && location.pathname[location.pathname.length - 2] === '/'))
            id = parts[parts.length - 2];
        else
            id = parts[parts.length - 1];

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/send_test/" + id, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                if (!json.success)
                    notifications.innerHTML = "<b>" + json.error + ".</b>";
                else
                    window.location.replace("?completed=true");
            }
        };
        xhr.send(JSON.stringify({ data: data }));
    });
}