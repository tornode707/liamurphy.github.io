const page = document.body.dataset.page || "default";
const enterMode = document.body.dataset.enterMode || "auto";
const enterAudioPath = document.body.dataset.enterAudio || "";

const enterScreen = document.getElementById("enter-screen");
const enterText = document.getElementById("enter-text");
const enterVideo = document.getElementById("enter-video");
const siteShell = document.getElementById("site-shell");
const backgroundVideo = document.getElementById("bg-video");
const backgroundAudio = document.getElementById("bg-audio");

const typewriterText = "click to enter...";
let typingTimer;
let isTransitioning = false;

const revealSite = () => {
    if (siteShell) {
        siteShell.classList.remove("is-hidden");
    }
};

const tryPlayVideo = async (withSound = false) => {
    if (!backgroundVideo) {
        return;
    }

    backgroundVideo.muted = !withSound;

    try {
        await backgroundVideo.play();
    } catch (error) {
        backgroundVideo.muted = true;
        await backgroundVideo.play().catch(() => {});
    }
};

const tryPlayAudio = async () => {
    if (!backgroundAudio && !enterAudioPath) {
        return;
    }

    const audio = backgroundAudio || new Audio(enterAudioPath);
    audio.loop = true;

    try {
        await audio.play();
    } catch (error) {
        return;
    }
};

const startTypewriterLoop = () => {
    if (!enterText) {
        return;
    }

    let index = 0;
    let deleting = false;

    const tick = () => {
        if (isTransitioning) {
            return;
        }

        if (!deleting) {
            enterText.classList.add("is-typing");
            enterText.classList.remove("is-erasing");
            index += 1;
            enterText.textContent = typewriterText.slice(0, index);

            if (index === typewriterText.length) {
                deleting = true;
                typingTimer = window.setTimeout(tick, 900);
                return;
            }

            typingTimer = window.setTimeout(tick, 90);
            return;
        }

        enterText.classList.remove("is-typing");
        enterText.classList.add("is-erasing");
        index -= 1;
        enterText.textContent = typewriterText.slice(0, index);

        if (index === 0) {
            deleting = false;
            typingTimer = window.setTimeout(tick, 260);
            return;
        }

        typingTimer = window.setTimeout(tick, 45);
    };

    enterText.textContent = "";
    tick();
};

const enterSite = async () => {
    if (isTransitioning) {
        return;
    }

    isTransitioning = true;
    window.clearTimeout(typingTimer);

    if (enterText) {
        enterText.classList.remove("is-typing", "is-erasing");
    }

    if (enterVideo) {
        enterVideo.pause();
    }

    enterScreen?.classList.add("is-hidden");
    revealSite();

    await Promise.all([
        tryPlayVideo(page === "home"),
        tryPlayAudio()
    ]);
};

const initGatePage = () => {
    if (!enterScreen) {
        revealSite();
        tryPlayVideo(false);
        return;
    }

    startTypewriterLoop();
    enterVideo?.play().catch(() => {});
    enterScreen.addEventListener("click", enterSite, { once: true });
};

const initAutoPage = () => {
    revealSite();
    tryPlayVideo(false);
};

if (enterMode === "gate") {
    initGatePage();
} else {
    initAutoPage();
}
