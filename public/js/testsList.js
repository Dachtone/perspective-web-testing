var completeSelectors = Array.from(document.getElementsByName('completed'));
completeSelectors.forEach((checkbox, index) => {
    checkbox.addEventListener("change", (event) => {
        var another = (index === 0 ? 1 : 0);
        if (checkbox.checked && completeSelectors[another].checked)
            completeSelectors[another].checked = false;
    });
});

var searchForm = document.getElementById("testsSearch");
if (searchForm !== null) {
    searchForm.addEventListener("submit", (event) => {
        var fields = Array.from(searchForm.children);

        fields.forEach((field) => {
            if ((field.tagName === "INPUT" || field.tagName === "SELECT") && (field.value.trim() == "" || field.value.trim() == "-1"))
                field.disabled = true;
        })
    });
}