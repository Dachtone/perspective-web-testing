var rows = Array.from(document.getElementsByClassName('marks_result')[0].children);

var maxLength = 0;
for (element of rows)
{
    if (element.className != 'user_result')
        break;
    
    // Will do just fine for now
    var name = element.children[0].children[0].children[0].innerHTML;
    if (name.length > 35)
        element.children[0].children[0].children[0].innerHTML = name.slice(0, 32) + '...';
    
    var points = element.children[1].children[1].children[1].textContent;
    if (points.length > maxLength)
        maxLength = points.length;
}

for (element of rows)
{
    if (element.className != 'user_result')
        break;
    
    // Very elegant solution, I know
    var points = element.children[1].children[1].children[1].textContent;
    for (var i = points.length; i < maxLength; i++)
        element.children[1].children[1].children[1].textContent = points + ' ';
}