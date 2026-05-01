const AI_API_URL = "https://nyi-site-ai-worker.nyi-site-ai-worker.workers.dev/api/chat";

let aiChatHistory = [];

function createAIChat() {
  const toggle = document.createElement("button");
  toggle.id = "ai-chat-toggle";
  toggle.type = "button";
  toggle.textContent = "AI";

  const box = document.createElement("div");
  box.id = "ai-chat-box";

  box.innerHTML = `
    <div id="ai-chat-header">
      <div>
        <div id="ai-chat-title">网站 AI 助手</div>
        <div id="ai-chat-subtitle">网站问答 / 普通 AI</div>
      </div>
      <button id="ai-chat-close" type="button">×</button>
    </div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-input-area">
      <input id="ai-chat-input" type="text" placeholder="问我网站内容，或当普通 AI 使用..." />
      <button id="ai-chat-send" type="button">发送</button>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(box);

  const closeBtn = document.getElementById("ai-chat-close");
  const sendBtn = document.getElementById("ai-chat-send");
  const input = document.getElementById("ai-chat-input");

  toggle.addEventListener("click", () => {
    box.classList.add("open");
    input.focus();

    if (aiChatHistory.length === 0) {
      addMessage(
        "assistant",
        "你好，我是这个网站的 AI 助手。你可以问我关于这个网站的问题，也可以把我当作普通 AI 使用。"
      );
    }
  });

  closeBtn.addEventListener("click", () => {
    box.classList.remove("open");
  });

  sendBtn.addEventListener("click", sendAIMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendAIMessage();
    }
  });
}

function addMessage(role, text) {
  const messages = document.getElementById("ai-chat-messages");

  const msg = document.createElement("div");
  msg.className = `ai-msg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.textContent = text;

  msg.appendChild(bubble);
  messages.appendChild(msg);

  messages.scrollTop = messages.scrollHeight;
}

function removeLastThinkingMessage() {
  const messages = document.getElementById("ai-chat-messages");
  const last = messages.lastElementChild;

  if (!last) {
    return;
  }

  const bubble = last.querySelector(".ai-bubble");

  if (bubble && bubble.textContent === "正在思考...") {
    messages.removeChild(last);
  }
}

async function sendAIMessage() {
  const input = document.getElementById("ai-chat-input");
  const sendBtn = document.getElementById("ai-chat-send");

  const message = input.value.trim();

  if (!message) {
    return;
  }

  addMessage("user", message);

  aiChatHistory.push({
    role: "user",
    content: message
  });

  input.value = "";
  sendBtn.disabled = true;
  sendBtn.textContent = "发送中";

  addMessage("assistant", "正在思考...");

  try {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        history: aiChatHistory
      })
    });

    const data = await res.json();

    removeLastThinkingMessage();

    if (!res.ok) {
      addMessage("assistant", "抱歉，AI 服务暂时出现问题，请稍后再试。");
      console.error("AI API error:", data);
      return;
    }

    const answer = data.answer || "抱歉，我暂时没有得到有效回答。";

    addMessage("assistant", answer);

    aiChatHistory.push({
      role: "assistant",
      content: answer
    });

    if (aiChatHistory.length > 12) {
      aiChatHistory = aiChatHistory.slice(-12);
    }
  } catch (error) {
    removeLastThinkingMessage();
    addMessage("assistant", "抱歉，暂时无法连接 AI 服务。");
    console.error("Fetch error:", error);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "发送";
    input.focus();
  }
}

document.addEventListener("DOMContentLoaded", createAIChat);
