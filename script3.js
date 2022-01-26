const { PDFDocument, StandardFonts, rgb } = PDFLib;

var img = new Image();

var loadingTask1;

var c_x, c_y, c_height, c_width;

var pdf = null;

var pageNumber = 1;
var flag = false;
var cropper = null;
var pdfBytes = null;
var totalPages = 1; 
const val = document.getElementById("numVal");

const allpages = () =>{
  flag = true;
}

const file = (input) => {
  let fileReader = new FileReader();
  if (input.files && input.files[0]) {
    CurrentPdf = input.files[0];
    fileReader.readAsDataURL(CurrentPdf);
  }

  fileReader.onload = async function (fileLoadedEvent) {
    const loadingTask = await pdfjsLib.getDocument(fileReader.result);

    console.log(loadingTask);

    //get the pdf data to render it
    loadingTask.promise.then(function (pdff) {
      totalPages = pdff.numPages;
      val.setAttribute("placeholder", "1-" + `${totalPages}`);
      val.setAttribute("max", `${totalPages}`);
      console.log(pdff);
      pdf = pdff;
      renderpage(pageNumber);
    });

    var URL = fileLoadedEvent.target.result;
    loadingTask1 = await fetch(URL).then((res) => res.arrayBuffer());
    CurrentPdf_PDFLIB = loadingTask1;
    console.log(loadingTask1);
    // modifyPdf(loadingTask1);
  };
};

// render pdf page and convert it into image and then get the croping dimentions
function renderpage(num) {
  console.log("PDF loaded");
  console.log(num);
  // Fetch the first page
  $("#img_container").html("");
  $("#img_container").html("<canvas id='my_canvas'></canvas>");

  var canvas = document.getElementById("my_canvas");
  var context = canvas.getContext("2d");
  // canvas.style.display = "block";

  pdf.getPage(num).then(function (page) {
    console.log("Page loaded");

    var scale = 1;
    var viewport = page.getViewport({ scale: scale });

    // Prepare canvas using PDF page dimensions

    canvas.height = page.getViewport({ scale: 1 }).height;
    canvas.width = page.getViewport({ scale: 1 }).width;

    document.getElementById("img_container").style.height =
      `${canvas.height}` + "px";
    document.getElementById("img_container").style.width =
      `${canvas.width}` + "px";

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    img.id = "hi";
    var renderTask = page.render(renderContext);
    canvas.style.display = "none";
    renderTask.promise.then(function () {
      // var img = new Image();
      img.src = canvas.toDataURL("image/jpeg");
      document.getElementById("img_container").appendChild(img);
      console.log(img);
      cropper = new Cropper(img, {
        viewMode: 3,
        zoomable: false,
        crop(event) {
          c_x = event.detail.x;
          c_y = event.detail.y;
          c_width = event.detail.width;
          c_height = event.detail.height;
        },  
      });
      console.log(cropper);
    });
  });
  console.log("done");
}

// function to trigger actual cropping of pdf
function modify() {
  modifyPdf(loadingTask1);
}

//pdf cropping function
async function modifyPdf(existingPdfBytes) {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  if (flag == true) {
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      let page_ = pdfDoc.getPage(i);
      let h_ = page_.getHeight();
      page_.setCropBox(c_x, h_ - c_y - c_height, c_width, c_height);
    }
  } else {
    let page = pdfDoc.getPage(pageNumber - 1);
    let h = page.getHeight();

    page.setCropBox(c_x, h - c_y - c_height, c_width, c_height);
    pdfDoc.addPage([100, 100]);
  }

  pdfBytes = await pdfDoc.save();

  const loadingTask2 = pdfjsLib.getDocument(pdfBytes);
    loadingTask2.promise.then((CurrentPdfFile) => {
      console.log(CurrentPdfFile)
      cropper.destroy();
      pdf = CurrentPdfFile ;
      renderpage(pageNumber);
    });

  // var binaryData = [];
  // binaryData.push(pdfBytes);
  // const blobUrl = window.URL.createObjectURL(
  //   new Blob(binaryData, { type: "application/pdf" })
  // );

  // var link = document.createElement("a");
  // link.setAttribute("target", "_blank");
  // link.href = blobUrl;
  // //   link.download = "pdfBytes";
  // link.dispatchEvent(new MouseEvent("click"));

  // console.log(pdfBytes);
  loadingTask1 = pdfBytes;
}

const nextPage = () => {
  cropper.destroy();
  pageNumber++;
  renderpage(pageNumber);
};
const prePage = () => {
  cropper.destroy();
  pageNumber--;
  renderpage(pageNumber);
};
const inputVal = () => {
  cropper.destroy();
  pageNumber = parseInt(val.value);
  console.log(val);
  renderpage(pageNumber);
};
const done = () => {
  var binaryData = [];
  binaryData.push(pdfBytes);
  const blobUrl = window.URL.createObjectURL(
    new Blob(binaryData, { type: "application/pdf" })
  );

  var link = document.createElement("a");
  link.setAttribute("target", "_blank");
  link.href = blobUrl;
  //   link.download = "pdfBytes";
  link.dispatchEvent(new MouseEvent("click"));

  console.log(pdfBytes);
};
