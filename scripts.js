// Real-Time Audio Recording and Analysis
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const uploadBtn = document.getElementById('uploadBtn');
const audioInput = document.getElementById('audioInput');
const waveform = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'green',
    progressColor: 'lime'
});

let mediaRecorder;
let audioChunks = [];
let meydaAnalyzer;
let audioContext, sourceNode;

// Real-Time Visualization and Feature Extraction
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    sourceNode = audioContext.createMediaStreamSource(stream);
    meydaAnalyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: sourceNode,
        bufferSize: 512,
        featureExtractors: ['rms', 'spectralCentroid', 'pitch'],
        callback: updateFeatures
    });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.start();
    meydaAnalyzer.start();

    recordBtn.disabled = true;
    stopBtn.disabled = false;
}

function stopRecording() {
    mediaRecorder.stop();
    meydaAnalyzer.stop();

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    waveform.loadBlob(audioBlob);

    recordBtn.disabled = false;
    stopBtn.disabled = true;
}

// Update Features in Real-Time
function updateFeatures(features) {
    document.getElementById('rms').innerText = features.rms.toFixed(4);
    document.getElementById('centroid').innerText = features.spectralCentroid.toFixed(2);
    document.getElementById('pitch').innerText = features.pitch.toFixed(2);
    updateEngagement(features.rms);
}

// Dynamic Engagement and Sentiment Scoring
function updateEngagement(rms) {
    const threshold = parseFloat(localStorage.getItem('threshold')) || 0.5;
    const engagement = rms > threshold ? 'High' : 'Low';
    document.getElementById('engagement').innerText = engagement;

    updateSentimentChart(rms * 100);
}

function updateSentimentChart(value) {
    if (window.sentimentChart) {
        window.sentimentChart.data.datasets[0].data.push(value);
        window.sentimentChart.update();
    }
}

// Chart Initialization
const ctx = document.getElementById('sentimentChart').getContext('2d');
window.sentimentChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{ label: 'Engagement Levels', data: [], backgroundColor: 'rgba(0,255,0,0.2)' }]
    }
});

// Settings Panel
document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'block';
});
document.getElementById('saveSettings').addEventListener('click', () => {
    const threshold = document.getElementById('thresholdInput').value;
    localStorage.setItem('threshold', threshold);
    document.getElementById('settingsModal').style.display = 'none';
});
document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'none';
});

// Event Listeners
recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
uploadBtn.addEventListener('click', () => audioInput.click());
audioInput.addEventListener('change', e => waveform.loadBlob(e.target.files[0]));
