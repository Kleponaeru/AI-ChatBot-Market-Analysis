// Tab switching
// document.querySelectorAll(".tab-button").forEach((button) => {
//   button.addEventListener("click", () => {
//     // Remove active class from all tabs
//     document
//       .querySelectorAll(".tab-button")
//       .forEach((btn) => btn.classList.remove("active"));
//     document
//       .querySelectorAll(".tab-content")
//       .forEach((content) => content.classList.remove("active"));

//     // Add active class to clicked tab
//     button.classList.add("active");
//     document.getElementById(button.dataset.tab).classList.add("active");
//   });
// });

function toggleCurrencySelect() {
  const dataType = document.getElementById("dataType").value; // Get selected data type
  const currencySelect = document.getElementById("currency"); // Get currency select element

  if (dataType === "stock") {
    currencySelect.style.display = "none"; // Hide currency select for stocks
  } else {
    currencySelect.style.display = "inline"; // Show currency select for cryptocurrencies
  }
}

// Initial call to set visibility on page load based on default selection
document.addEventListener("DOMContentLoaded", () => {
  toggleCurrencySelect();
});

//Market data
const BASE_URL = "http://127.0.0.1:5000"; // Ensure your BASE_URL is defined

function fetchMarketData() {
  const dataType = document.getElementById("dataType").value; // crypto or stock
  const symbol = document.querySelector('input[type="text"]').value.trim(); // symbol input
  const currency = document.getElementById("currency").value; // currency input

  // Validate input
  if (!symbol) {
    alert("Please enter a symbol.");
    return;
  }

  // Define the API endpoint based on the selected data type
  let endpoint = "";
  if (dataType === "crypto") {
    endpoint = `${BASE_URL}/api/crypto/${symbol}/${currency}`; // For cryptocurrency data
  } else if (dataType === "stock") {
    endpoint = `${BASE_URL}/api/stock/${symbol}`; // For stock data
  }

  console.log("Fetching data from:", endpoint); // Log the endpoint for debugging

  // Fetch market data from the API
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Network response was not ok, Status: " + response.status
        );
      }
      return response.json();
    })
    .then((data) => {
      // Log the entire response data for debugging
      console.log("Response Data:", data);

      // Check if the data structure is what we expect
      if (dataType === "crypto" && !data.daily_data) {
        throw new Error(
          "Unexpected response structure for cryptocurrency data."
        );
      } else if (dataType === "stock" && !data.stock_data) {
        throw new Error("Unexpected response structure for stock data.");
      }

      // Handle the market data response
      displayMarketData(data, dataType); // Call your display function to handle the data
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to fetch market data. Please try again.");
    });
}

function displayMarketData(data, dataType) {
  const marketDataContainer = document.getElementById("marketData");
  marketDataContainer.innerHTML = ""; // Clear previous data

  if (dataType === "crypto") {
    // Create a table for cryptocurrency data
    const table = document.createElement("table");
    table.className = "market-table";

    // Create table header
    const headerRow = document.createElement("tr");
    const headers = ["Date", "Open", "High", "Low", "Close", "Volume"];
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate table rows with daily data
    data.daily_data.forEach((entry) => {
      const row = document.createElement("tr");
      // Ensure each entry has the required properties
      const open = entry.open !== undefined ? entry.open.toFixed(2) : "N/A";
      const high = entry.high !== undefined ? entry.high.toFixed(2) : "N/A";
      const low = entry.low !== undefined ? entry.low.toFixed(2) : "N/A";
      const close = entry.close !== undefined ? entry.close.toFixed(2) : "N/A";
      const volume =
        entry.volume !== undefined ? entry.volume.toFixed(2) : "N/A";

      row.innerHTML = `
          <td>${entry.index}</td>
          <td>${open}</td>
          <td>${high}</td>
          <td>${low}</td>
          <td>${close}</td>
          <td>${volume}</td>
        `;
      table.appendChild(row);
    });

    // Display exchange rate
    const exchangeRate = document.createElement("div");
    exchangeRate.innerText = `Exchange Rate: ${data.exchange_rate.from_currency} to ${data.exchange_rate.to_currency}: ${data.exchange_rate.exchange_rate}`;

    marketDataContainer.appendChild(exchangeRate);
    marketDataContainer.appendChild(table);
  } else if (dataType === "stock") {
    // Create a table for stock data
    const table = document.createElement("table");
    table.className = "market-table";

    // Create table header
    const headerRow = document.createElement("tr");
    const headers = ["Date", "Open", "High", "Low", "Close", "Volume"];
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate table rows with stock data
    data.stock_data.forEach((entry) => {
      const row = document.createElement("tr");
      // Ensure each entry has the required properties
      const open = entry.open !== undefined ? entry.open.toFixed(2) : "N/A";
      const high = entry.high !== undefined ? entry.high.toFixed(2) : "N/A";
      const low = entry.low !== undefined ? entry.low.toFixed(2) : "N/A";
      const close = entry.close !== undefined ? entry.close.toFixed(2) : "N/A";
      const volume =
        entry.volume !== undefined ? entry.volume.toFixed(2) : "N/A";

      row.innerHTML = `
          <td>${entry.index}</td>
          <td>${open}</td>
          <td>${high}</td>
          <td>${low}</td>
          <td>${close}</td>
          <td>${volume}</td>
        `;
      table.appendChild(row);
    });

    marketDataContainer.appendChild(table);
  } else {
    console.error("Unexpected data type:", dataType);
    alert("Unexpected data type received.");
  }
}

// Chat functionality
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const md = new markdownit();

function addMessage(message, isUser = true) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user" : "bot"}`;

  // Use markdown-it to convert Markdown to HTML
  messageDiv.innerHTML = md.render(message);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    // Add the user's message to the chat
    addMessage(message, true);
    chatInput.value = "";

    // Create and display the loading indicator
    const loadingIndicator = `
          <div class="message bot loading-indicator">
              <div class="dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
              </div>
          </div>`;
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.insertAdjacentHTML("beforeend", loadingIndicator);

    // Send the user's message to the backend
    fetch("/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: message }), // Use the user input here
    })
      .then((response) => response.json())
      .then((data) => {
        // Remove loading indicator
        const loadingMessage = chatMessages.querySelector(".loading-indicator");
        if (loadingMessage) {
          chatMessages.removeChild(loadingMessage);
        }

        // Display the chatbot's response
        addMessage(data.response, false);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Remove loading indicator
        const loadingMessage = chatMessages.querySelector(".loading-indicator");
        if (loadingMessage) {
          chatMessages.removeChild(loadingMessage);
        }
        // Optionally, show an error message in the chat
        addMessage("Error: Unable to get response from the chatbot.", false);
      });
  }
}

// Handle Enter key in chat input
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Function to populate quick replies
function populateQuickReplies() {
  const quickReplies = document.getElementById("quickReplies");
  const replies = [
      "Hello",
      "Can you help me?",
      "Make me short essay",
      "Tell me a joke"
  ];

  // Clear existing replies
  quickReplies.innerHTML = '';

  replies.forEach(reply => {
      const button = document.createElement("button");
      button.textContent = reply;
      button.className = "quick-reply-btn";
      button.onclick = () => sendQuickReply(reply);
      quickReplies.appendChild(button);
  });
}

// Function to send quick replies
function sendQuickReply(reply) {
  // Add the quick reply to the chat
  addMessage(reply, true);

  // Create and display the loading indicator
  const loadingIndicator = `
      <div class="message bot loading-indicator">
          <div class="dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
          </div>
      </div>`;
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.insertAdjacentHTML('beforeend', loadingIndicator);

  // Send the quick reply to the backend
  fetch("/chatbot", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: reply }), // Use the quick reply here
  })
  .then((response) => response.json())
  .then((data) => {
      // Remove loading indicator
      const loadingMessage = chatMessages.querySelector('.loading-indicator');
      if (loadingMessage) {
          chatMessages.removeChild(loadingMessage);
      }

      // Display the chatbot's response
      addMessage(data.response, false);
  })
  .catch((error) => {
      console.error("Error:", error);
      // Remove loading indicator
      const loadingMessage = chatMessages.querySelector('.loading-indicator');
      if (loadingMessage) {
          chatMessages.removeChild(loadingMessage);
      }
      // Optionally, show an error message in the chat
      addMessage("Error: Unable to get response from the chatbot.", false);
  });
}

// Call populateQuickReplies to initialize the quick replies when the chat loads
populateQuickReplies();

