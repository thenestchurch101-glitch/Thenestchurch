"use client";

import { FormEvent, useState } from "react";

export function PrayerForm() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      "Prayer request captured in the frontend prototype. Connect this form to your future API or CMS endpoint."
    );
    event.currentTarget.reset();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-grid two">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
      </div>

      <label>
        Category
        <select name="category" defaultValue="guidance">
          <option value="healing">Physical & Mental Healing</option>
          <option value="guidance">Guidance & Direction</option>
          <option value="financial">Financial Breakthrough</option>
          <option value="family">Family & Relationships</option>
          <option value="spiritual">Spiritual Growth</option>
          <option value="career">Career & Education</option>
          <option value="other">Other Requests</option>
        </select>
      </label>

      <label>
        Prayer Request
        <textarea name="description" required />
      </label>

      {status ? <p className="status-message">{status}</p> : null}

      <button className="button" type="submit">
        Submit Prayer Request
      </button>
    </form>
  );
}
