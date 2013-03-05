var fileNumber = 2;
function addFileInputToForm() {
    var files = document.getElementById("files");
    var input = document.createElement("input");
    input.name = "file_" + fileNumber;
    input.type = "file";
    files.appendChild(input);
    fileNumber++;
}
