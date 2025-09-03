document.addEventListener("DOMContentLoaded", () => {
  const isIframe = window.parent != null && window != window.parent;

  const CSS_ANIMATION_DURATION = 200;

  const CSS_CLASS_SCREEN_HIDE = "screen-hide";
  const CSS_CLASS_ACTIVE_FEATURE_BOTTOM_BTN = "active";

  const screenContentSection = document.querySelector(".screen-content");
  const allScreens = document.querySelectorAll("[data-screen-item]");
  const mainScreen = document.querySelector(".main-screen");

  const featuresMainScreen = document.querySelectorAll(".feature");
  const featuresCmdsSections = document.querySelectorAll(".cmd-item");

  const featureBottomBtn = document.querySelector(".fixed-btn");

  const toasterSection = document.querySelector(".copy-label");
  const toasterSectionSuccessMsg = document.querySelector(".copy-label__text_success");
  const toasterSectionErrorMsg = document.querySelector(".copy-label__text_error");
  const TOASTER_STATUS = {
    SUCCESS: "success",
    ERROR: "error",
  };
  let successMsgTimerId;

  const fixedCtaBtn = document.querySelector(".fixed-btn__btn");

  const footerUrls = document.querySelectorAll(".main-screen__footer-url");

  const backBtn = document.querySelector(".back-btn");

  backBtn.addEventListener("click", backBtnHandler);

  featuresMainScreen.forEach((feature) => {
    feature.addEventListener("click", () => {
      const featureAtr = feature.getAttribute("data-feature-item");

      if (featureAtr) {
        showFeatureSection(featureAtr);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, CSS_ANIMATION_DURATION);
        webAppSetupBackButton(true);
      }
    });
  });

  featuresCmdsSections.forEach((cmd) => {
    cmd.addEventListener("click", () => {
      const copyText = cmd.querySelector(".cmd-item__text");

      if (copyText && copyText.textContent) {
        fallbackCopyTextToClipboard(copyText.textContent);
        showToaster();
      }
    });
  });

  // Функция для fallback метода копирования
  function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text
      .replace(/(\r\n|\n)/g, "")
      .replace(/\s+/g, " ")
      .trim();
    textarea.style.position = "fixed"; // Избегаем скроллинга страницы
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("[DEBUG INFO]: Текст успешно скопирован!");
      changeToasterContent(TOASTER_STATUS.SUCCESS);
    } catch (err) {
      console.error("[DEBUG INFO]: Ошибка при копировании: ", err);
      changeToasterContent(TOASTER_STATUS.ERROR);
    }

    document.body.removeChild(textarea);
  }

  function showFeatureSection(featureDataAtr) {
    const featureSection = document.querySelector(`.feature-screen[data-screen-item="${featureDataAtr}"]`);
    controlContent(featureSection);
  }

  function controlContent(activeScreen) {
    allScreens.forEach((screen) => screen.classList.add(CSS_CLASS_SCREEN_HIDE));
    activeScreen.classList.remove(CSS_CLASS_SCREEN_HIDE);

    if (activeScreen !== mainScreen) {
      featureBottomBtn.classList.add(CSS_CLASS_ACTIVE_FEATURE_BOTTOM_BTN);
    } else {
      featureBottomBtn.classList.remove(CSS_CLASS_ACTIVE_FEATURE_BOTTOM_BTN);
    }

    setTimeout(() => {
      const sectionHeight = activeScreen.offsetHeight;
      screenContentSection.style.height = `${sectionHeight}px`;
    }, CSS_ANIMATION_DURATION);
  }

  function backBtnHandler() {
    controlContent(mainScreen);
    webAppSetupBackButton(false);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, CSS_ANIMATION_DURATION);
  }

  footerUrls.forEach((url) => {
    url.addEventListener("click", (e) => {
      e.preventDefault();
      const urlHref = url.getAttribute("href");
      webAppOpenLink(urlHref);
    });
  });

  function changeToasterContent(type) {
    if (type === TOASTER_STATUS.SUCCESS) {
      toasterSectionSuccessMsg.style.display = "block";
      toasterSectionErrorMsg.style.display = "none";
    } else if (type === TOASTER_STATUS.ERROR) {
      toasterSectionSuccessMsg.style.display = "none";
      toasterSectionErrorMsg.style.display = "block";
    }
  }

  function showToaster() {
    if (toasterSection.classList.contains("active")) {
      toasterSection.classList.remove("active");

      if (successMsgTimerId) {
        clearTimeout(successMsgTimerId);
      }

      successMsgTimerId = setTimeout(() => {
        toasterSection.classList.add("active");
      }, 10);
    } else {
      toasterSection.classList.add("active");
    }
  }

  fixedCtaBtn.addEventListener("click", () => {
    webAppClose();
  });

  function webAppClose() {
    postEvent("web_app_close", {});
  }

  function webAppSetupBackButton(isVisible) {
    if (isVisible) {
      backBtn.classList.add("active");
    } else {
      backBtn.classList.remove("active");
    }
  }

  function webAppOpenLink(url) {
    postEvent("web_app_open_link", { url });
  }

  function postEvent(eventType, eventData) {
    console.log("[Telegram.WebView] > postEvent", eventType, eventData);

    if (window.TelegramWebviewProxy !== undefined) {
      TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
    } else if (window.external && "notify" in window.external) {
      window.external.notify(JSON.stringify({ eventType: eventType, eventData: eventData }));
    } else if (isIframe) {
      try {
        const trustedTarget = "https://web.telegram.org";
        trustedTarget = "*";
        window.parent.postMessage(JSON.stringify({ eventType: eventType, eventData: eventData }), trustedTarget);
      } catch (e) {}
    }
  }
});
