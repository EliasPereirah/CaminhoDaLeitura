const WORDS_COUNT = wordsData.length;
const SENTENCES_LEVEL_2_COUNT = sentencesData.level_2.length;
const SENTENCES_LEVEL_3_COUNT = sentencesData.level_3.length;

const TOTAL_EXERCISES = WORDS_COUNT + SENTENCES_LEVEL_2_COUNT + SENTENCES_LEVEL_3_COUNT;
const MAX_TOTAL_INDEX = TOTAL_EXERCISES - 1;

const LEVEL_2_OFFSET = WORDS_COUNT;
const LEVEL_3_OFFSET = WORDS_COUNT + SENTENCES_LEVEL_2_COUNT;

let currentIndex = parseInt(localStorage.getItem("index") || '0');
if (currentIndex < 0 || currentIndex > MAX_TOTAL_INDEX) {
    currentIndex = 0; // Reinicia se o índice estiver fora dos limites
    localStorage.setItem("index", currentIndex); // Salva o índice resetado
}

const sentence_element = document.getElementById('sentence');
const word_element = document.getElementById('completeWord');
const syllables_element = document.getElementById('syllables');
const sentenceLevelBox = document.getElementById('sentence_level_box');
const wordLevelBox = document.getElementById('word_level_box');
const levelBox = document.getElementById('level_box');

let audioFilePath = '';
let has_played = false;
let progressFill = document.getElementById('progressFill');
let progressText = document.getElementById('progressText');

function showWordLevelElements() {
    wordLevelBox.style.display = 'block';
    sentenceLevelBox.style.display = 'none';
    word_element.innerText = ''; // Limpa antes de carregar
    syllables_element.innerText = ''; // Limpa antes de carregar
    sentence_element.innerText = ''; // Garante que a frase anterior seja limpa
}

function showSentenceLevelElements() {
    wordLevelBox.style.display = 'none';
    sentenceLevelBox.style.display = 'block';
    sentence_element.innerText = ''; // Limpa antes de carregar
    word_element.innerText = ''; // Garante que a palavra/sílaba anterior seja limpa
    syllables_element.innerText = '';
}

// --- Função para reproduzir o áudio ---
function playAudio() {
    removeDialog();
    has_played = true;
    const audio = new Audio(audioFilePath);
    audio.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
}

// --- Função principal para carregar o exercício atual ---
function loadExercise() {
    let data;
    let currentLevelText;
    let audioFileName = '';

    // Lógica para determinar o nível e carregar os dados
    if (currentIndex < WORDS_COUNT) {
        // Nível 1 - Apenas palavras
        currentLevelText = "Nível 1 - Palavras";
        showWordLevelElements();
        data = wordsData[currentIndex];
        word_element.innerText = data.word;
        syllables_element.innerText = data.details.syllable;
        audioFileName = `data/voices/${data.details.id}.mp3`;

        let progress_percentage = ((currentIndex + 1) * 100) / WORDS_COUNT;
        progressFill.style.width = `${progress_percentage}%`;
        progressText.innerText = `Progresso: ${currentIndex} de ${WORDS_COUNT}`;

    } else if (currentIndex < LEVEL_3_OFFSET) {
        // Nível 2 - Frases (com offset do Nível 1)
        currentLevelText = "Nível 2 - Frases";
        showSentenceLevelElements();
        const currentIndexByLevel = currentIndex - LEVEL_2_OFFSET;
        // Validação para evitar erros se o índice calculado for inválido
        if (currentIndexByLevel < 0 || currentIndexByLevel >= SENTENCES_LEVEL_2_COUNT) {
            console.error("Índice inválido para Nível 2:", currentIndexByLevel);
            return; // Sai da função para evitar erro
        }
        data = sentencesData.level_2[currentIndexByLevel];
        sentence_element.innerText = data.phrase;
        audioFileName = `data/frases/${data.file_name}`;

        let progress_percentage = ((currentIndexByLevel + 1) * 100) / SENTENCES_LEVEL_2_COUNT;
        progressFill.style.width = `${progress_percentage}%`;
        progressText.innerText = `Progresso: ${currentIndexByLevel} de ${SENTENCES_LEVEL_2_COUNT}`;

    } else {
        // Nível 3 - Frases (com offset dos Níveis 1 e 2)
        currentLevelText = "Nível 3 - Frases";
        showSentenceLevelElements();
        const currentIndexByLevel = currentIndex - LEVEL_3_OFFSET;
        // Validação para evitar erros se o índice calculado for inválido
        if (currentIndexByLevel < 0 || currentIndexByLevel >= SENTENCES_LEVEL_3_COUNT) {
            console.error("Índice inválido para Nível 3:", currentIndexByLevel);
            return; // Sai da função para evitar erro
        }
        data = sentencesData.level_3[currentIndexByLevel];
        sentence_element.innerText = data.phrase;
        audioFileName = `data/frases/${data.file_name}`;

        let progress_percentage = ((currentIndexByLevel + 1) * 100) / SENTENCES_LEVEL_3_COUNT;
        progressFill.style.width = `${progress_percentage}%`;
        progressText.innerText = `Progresso: ${currentIndexByLevel} de ${SENTENCES_LEVEL_3_COUNT}`;

    }

    // Atualiza o texto do nível e toca o áudio
    levelBox.innerText = currentLevelText;
    audioFilePath = audioFileName;
}

function removeDialog() {
    let dialogs = document.querySelectorAll('.dialog');
    dialogs.forEach(d => {
        d.remove();
    })
}

function createDialog(text, add_class_name = '') {
    let dialog = document.createElement('div');
    dialog.classList.add('dialog');
    if (add_class_name) {
        dialog.classList.add(add_class_name);
    }
    dialog.innerHTML = text;
    dialog.style.display = 'block';
    dialog.onclick = () => {
        removeDialog();
    }
    document.body.appendChild(dialog);
    let ms = 5 * 1000;
    if (add_class_name === 'congratulations') {
        ms = 45 * 1000;
    }
    setTimeout(() => {
        removeDialog()
    }, ms)

}


function nextExercise() {
    removeDialog()
    if (!has_played) {
        createDialog('Por favor, clique em ouvir áudio antes de ir para a próxima palavra ou frase!');
        const audio_warning = new Audio('data/avisos/need_listen.mp3');
        audio_warning.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
        return false;
    }
    has_played = false;
    if ((currentIndex + 1) >= TOTAL_EXERCISES) {
        let congrats_msg = `<p>🎉 PARABÉNS! 🎉 PARABÉNS! 🎉 PARABÉNS!</p>
                                   <p>Você chegou ao final dos nossos exercícios! Que conquista incrível! 🏆✨</p>
                                   <p>Mas não pare por aqui! 😉</p>
                                   <p>Continue firme nos seus estudos, pois o conhecimento é um tesouro que ninguém pode
                                    tirar de você. É um investimento para a vida toda! 🧠💡🚀</p>
                                  <p>Estude com paixão, aprenda com dedicação! O futuro te espera! 🌟📚</p>`;
        createDialog(congrats_msg, 'congratulations');
        const audio_congratulations = new Audio('data/avisos/congratulations.mp3');
        audio_congratulations.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
        currentIndex = 0;
        let total_efeito = 0;
        let timer = setInterval(() => {
            total_efeito++;
            if (total_efeito >= 35) {
                clearInterval(timer);
            }else {
                efeitoConfete();
            }
        }, 150);
        return false;
    }

    currentIndex++;

    loadExercise();
    localStorage.setItem("index", currentIndex);
}


document.addEventListener('DOMContentLoaded', loadExercise);


function efeitoConfete() {
    const cores = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#00f', '#ffa500'];
    for (let i = 0; i < 100; i++) {
        const confete = document.createElement('div');
        confete.classList.add('confete');
        confete.style.left = Math.random() * 100 + 'vw';
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        confete.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(confete);

        setTimeout(() => {
            confete.remove();
        }, 4000); // remove após a animação
    }
}