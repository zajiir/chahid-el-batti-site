import friends from "../content/friends.json";

export default function Friends() {
  return (
    <div className="page page--narrow">
      <div className="page-head">
        <span className="eyebrow">19 / FRIENDS (TOGETHER)</span>
        <h1>{friends.heading}</h1>
      </div>
      <div className="friends__placeholder">
        <span className="friends__glyph">19</span>
        <p>{friends.message}</p>
      </div>
    </div>
  );
}
