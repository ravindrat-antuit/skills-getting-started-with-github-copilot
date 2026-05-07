/**
 * Mergington High School – Extracurricular Activities
 * TypeScript frontend for the activities management app.
 */

interface Activity {
  description: string;
  schedule: string;
  duration: string;
  activity_type: string;
  max_participants: number;
  participants: string[];
}

type ActivitiesMap = Record<string, Activity>;

document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById(
    "activities-list"
  ) as HTMLDivElement;
  const activitySelect = document.getElementById(
    "activity"
  ) as HTMLSelectElement;
  const signupForm = document.getElementById("signup-form") as HTMLFormElement;
  const messageDiv = document.getElementById("message") as HTMLDivElement;

  /** Fetch activities from the API and render them */
  async function fetchActivities(): Promise<void> {
    try {
      const response = await fetch("/activities");
      const activities: ActivitiesMap = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const spotsLeft =
          details.max_participants - details.participants.length;
        const isFull = spotsLeft <= 0;

        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <div class="activity-badges">
            <span class="badge badge-type">${details.activity_type}</span>
            <span class="badge badge-spots ${isFull ? "badge-full" : "badge-open"}">
              ${isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
            </span>
          </div>
          <p class="activity-description">${details.description}</p>
          <ul class="activity-details">
            <li><span class="detail-icon">🗓</span><strong>Schedule:</strong> ${details.schedule}</li>
            <li><span class="detail-icon">⏱</span><strong>Duration:</strong> ${details.duration}</li>
            <li><span class="detail-icon">👥</span><strong>Capacity:</strong> ${details.participants.length} / ${details.max_participants} enrolled</li>
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (isFull) {
          option.disabled = true;
          option.textContent += " (Full)";
        }
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  /** Handle sign-up form submission */
  signupForm.addEventListener("submit", async (event: Event) => {
    event.preventDefault();

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const activity = (document.getElementById("activity") as HTMLSelectElement)
      .value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const result: { message?: string; detail?: string } =
        await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message ?? "Signed up successfully!";
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activity list to reflect updated enrollment counts
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail ?? "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
