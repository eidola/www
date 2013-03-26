var fileNumber = 2;
function addFileInputToForm() {
    var files = document.getElementById("files");
    var input = document.createElement("input");
    input.name = "file_" + fileNumber;
    input.type = "file";
    files.appendChild(input);
    fileNumber++;
}
function handleFiles(files) {
    var files = files.files;
    var imageType = /image.*/;
    if(files.name == 'cover' && file.type.match(imageType)) {
	for (var i=0;i<files.length; i++) {
	    var file = files[i];
	    var preview = document.getElementById('preview');
	    var img = document.createElement("img");
	    img.classList.add("obj");
	    img.file = file;
	    preview.appendChild(img);
	    
	    var reader = new FileReader();
	    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
	    reader.readAsDataURL(file);
	    
	}
    }
}

