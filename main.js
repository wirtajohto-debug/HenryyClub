// Firebase config (placeholder)
const firebaseConfig = {
  apiKey: "AIzaSyAGqaifr-68EzB85IvHGHMo7af3FAERryo",
  authDomain: "henryclub-383e5.firebaseapp.com",
  projectId: "henryclub-383e5",
  storageBucket: "henryclub-383e5.firebasestorage.app",
  messagingSenderId: "972447053262",
  appId: "1:972447053262:web:008a5a04c7a17e2645279f",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// =====================
// Rekisteröinti
// =====================
async function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    if(!username || !password) return alert('Täytä tunnus ja salasana');

    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
    if(doc.exists) return alert('Tunnus on jo käytössä');

    await userRef.set({ password, saldo: 0 });
    alert('Rekisteröinti onnistui! Voit nyt kirjautua sisään.');
}

// =====================
// Login
// =====================
async function login(username, password) {
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
    if (!doc.exists) { alert('Käyttäjää ei löydy'); return; }
    if(doc.data().password !== password) { alert('Väärä salasana'); return; }

    sessionStorage.setItem('username', username);
    document.getElementById('loginDiv').style.display = 'none';
    document.getElementById('registerDiv').style.display = 'none';

    if(username==='011100'){ // Admin tunnus
        document.getElementById('adminDashboard').style.display = 'block';
    } else {
        document.getElementById('userDashboard').style.display = 'block';
        updateSaldoDisplay();
    }
}

// =====================
// Päivitä saldo näkyviin
// =====================
async function updateSaldoDisplay() {
    const username = sessionStorage.getItem('username');
    const doc = await db.collection('users').doc(username).get();
    document.getElementById('saldoDisplay').innerText = doc.data().saldo || 0;
}

// =====================
// HenryyLotto
// =====================
async function playHenryyLotto() {
    const username = sessionStorage.getItem('username');
    if(!username) return alert('Kirjaudu sisään');

    const numbers = document.getElementById('lottoNumbers').value.split(',').map(n=>parseInt(n.trim()));
    const rows = parseInt(document.getElementById('lottoRows').value);
    if(numbers.length !==7) return alert('Syötä 7 numeroa');
    if(rows<1 || rows>10) return alert('Rivien määrä 1-10');

    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
    const saldo = doc.data().saldo || 0;
    const cost = 0.5*rows;
    if(saldo<cost) return alert('Ei tarpeeksi saldoa');

    await userRef.update({ saldo: saldo-cost });
    await db.collection('henryyLottoTickets').add({username, numbers, rows, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    alert('Rivit lähetetty!');
    updateSaldoDisplay();
}

// =====================
// HenryyOriginal
// =====================
async function playHenryyOriginal() {
    const username = sessionStorage.getItem('username');
    if(!username) return alert('Kirjaudu sisään');

    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
    const saldo = doc.data().saldo || 0;
    if(saldo<0.5) return alert('Ei tarpeeksi saldoa');

    await userRef.update({ saldo: saldo-0.5 });
    await db.collection('henryyOriginalOrders').add({username, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    alert('Osallistuminen lähetetty!');
    updateSaldoDisplay();
}

// =====================
// Admin saldon lisäys
// =====================
async function addSaldo() {
    const adminUser = document.getElementById('adminUser').value;
    const adminPass = document.getElementById('adminPass').value;
    const targetUser = document.getElementById('targetUser').value;
    const amount = parseFloat(document.getElementById('saldoAmount').value);

    if(adminUser!=='011100' || adminPass!=='143000') return alert('Väärä admin');
    const userRef = db.collection('users').doc(targetUser);
    const doc = await userRef.get();
    if(!doc.exists) return alert('Käyttäjää ei löydy');

    await userRef.update({ saldo: (doc.data().saldo||0)+amount });
    alert('Saldo lisätty');
}

// =====================
// Admin video
// =====================
async function uploadWinVideo(file) {
    const storageRef = storage.ref('winningVideo/' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    alert('Video ladattu: '+url);
}
