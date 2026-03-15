import "./RepCard.css";

export default function RepCard({ fullName, title, department, focus, validated, email, bio, initials }) {
  return (
    <div className="rep-card">
      <div className="rep-card__avatar">{initials}</div>
      <div className="rep-card__name">{fullName}</div>
      <div className="rep-card__title">{title}</div>
      <div className="rep-card__dept">{department}</div>

      <span className="rep-card__focus">{focus}</span>

      <p className="rep-card__bio">{bio}</p>

      <div className={"rep-card__validated" + (validated ? " rep-card__validated--yes" : "")}>
        {validated
          ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Train the Trainer Certified</>
          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg> Pending Validation</>
        }
      </div>

      <a href={`mailto:${email}`} className="rep-card__email">{email}</a>
    </div>
  );
}