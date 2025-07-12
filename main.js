const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");
const button = document.querySelector(".capture");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch((err) => {
      console.error(`OH NO!!!`, err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    //* take the pixel out
    let pixels = ctx.getImageData(0, 0, width, height);
    //* mess with them
    // pixels = redEffect(pixels);
    // pixels = rgbSplits(pixels);
    // ctx.globalAlpha = 0.1;
    pixels = greenScreen(pixels);
    //* put them back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function countdown() {
  return new Promise((resolve, reject) => {
    const delay = parseInt(document.querySelector("#delay").value, 10);
    if (isNaN(delay) || delay < 0) return reject("Invalid delay");
    if (delay === 0) resolve();
    console.log(delay);

    let cnt = 0;

    span = document.querySelector(".delay-display");
    const intervalID = setInterval(() => {
      console.log("haha");
      if (cnt > delay) {
        clearInterval(intervalID);
        resolve();
      }
      span.innerHTML = cnt;
      cnt++;
    }, 1000);
  });
}

function takePhoto() {
  //* play the sound
  countdown()
    .then(() => {
      span.innerHTML = 0;
      snap.currentTime = 0;
      snap.play();

      //* take the data out of the canvas
      const data = canvas.toDataURL("image/jpeg");
      const link = document.createElement("a");
      link.href = data;
      link.setAttribute("download", "handsome");
      link.textContent = "Download Image";
      link.innerHTML = `<img src="${data}" alt="Beautiful Image" />`;
      strip.insertBefore(link, strip.firstChild);
    })
    .catch((error) => {
      console.error(error);
    });
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function rgbSplits(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
