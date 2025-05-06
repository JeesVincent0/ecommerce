function renderUsers(users) {
    const container = document.getElementById("userTableBody");
    container.innerHTML = ""; // Clear all rows
  
    users.forEach(user => {
      const row = document.createElement("tr");
      row.className = "border-b border-gray-200 hover:bg-gray-100";
  
      row.innerHTML = `
        <td class="py-3 px-6">${user.name}</td>
        <td class="py-3 px-6">${user.email}</td>
        <td class="py-3 px-6 ${user.isActive ? 'text-green-600' : 'text-red-600'}">
          ${user.isActive ? 'Active' : 'Blocked'}
        </td>
        <td class="py-3 px-6">
          <button 
            type="button"
            class="blockButton ${user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            text-white text-sm px-3 py-1 rounded"
            data-email="${user.email}">
            ${user.isActive ? 'Block' : 'Unblock'}
          </button>
          <button 
            type="button"
            class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded ml-1">
            View
          </button>
        </td>
      `;
  
      container.appendChild(row);
    });
  
    // Attach event listeners to block/unblock buttons
    document.querySelectorAll(".blockButton").forEach(button => {
      button.addEventListener("click", async (e) => {
        const email = e.target.dataset.email;
        const isBlocked = e.target.textContent.trim() === "Block";
  
        if (isBlocked) {
          // Ask for confirmation before blocking
          approve(email, e.target); // define this function elsewhere
        } else {
          const success = await UnBlockUser(email); // define this function elsewhere
  
          if (success) {
            e.target.textContent = "Block";
            e.target.classList.remove("bg-blue-600", "hover:bg-blue-700");
            e.target.classList.add("bg-red-600", "hover:bg-red-700");
          }
        }
      });
    });
  }
  