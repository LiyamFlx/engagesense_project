let recordedChunks = [];
async function processRecording() {
    document.getElementById('engagement').innerText = 'Analyzing...';
    setTimeout(() => {
        document.getElementById('engagement').innerText = '85%';
    }, 1000);
}