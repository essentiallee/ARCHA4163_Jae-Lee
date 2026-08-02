// Gallery chatbot browser code
// This follows the tutorial: read the input, send it, and display the reply.

(function () {
  const form = document.getElementById("gallery-chat-form");
  const input = document.getElementById("gallery-chat-input");
  const sendButton = document.getElementById("gallery-chat-send");
  const messages = document.getElementById("gallery-chat-messages");
  const status = document.getElementById("gallery-chat-status");

  function addMessage(sender, text) {
    const message = document.createElement("div");
    message.className = `gallery-chat-message ${sender}-message`;

    const label = document.createElement("div");
    label.className = "gallery-chat-message-label";
    label.textContent = sender === "user" ? "YOU" : "GALLERY ASSISTANT";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    message.append(label, paragraph);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendQuestion(question) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The chatbot could not answer.");
    }

    return data.answer;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    addMessage("user", question);
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    status.textContent = "Thinking…";

    try {
      const answer = await sendQuestion(question);
      addMessage("assistant", answer);
      status.textContent = "Ready";
    } catch (error) {
      addMessage("error", error.message);
      status.textContent = "Chatbot unavailable";
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  });

  document.querySelectorAll("[data-chat-question]").forEach(function (button) {
    button.addEventListener("click", function () {
      input.value = button.dataset.chatQuestion;
      input.focus();
    });
  });
})();
