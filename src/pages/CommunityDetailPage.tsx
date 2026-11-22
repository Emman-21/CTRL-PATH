import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { AlumniIdentity, AlumniStoryCard, TrackTagLogo } from '../components/community/CommunityCards';
import { StoryTopicIcon, type StoryTopicKey } from '../components/community/StoryTopicIcon';
import { CATEGORY_NAMES } from '../utils/achievementRules';
import { displayDate } from '../utils/communitySelectors';

export function CommunityDetailPage({ kind: _kind }: { kind?: 'alumni' } = {}) {
  const { id } = useParams();
  const { stories, loading, error, retry } = useCommunity();
  const story = stories.find((s) => s.id === id);
  const back = (
    <Link to="/alumni" className="community-text-link">
      <ArrowLeft size={16} />
      Back to Alumni Stories
    </Link>
  );
  if (loading) return <div className="community-empty" role="status">Loading published content…</div>;
  if (error) {
    return (
      <div className="community-empty" role="alert">
        {back}
        <p>{error}</p>
        <button onClick={retry} className="vault-primary-button">Try again</button>
      </div>
    );
  }
  if (!story) {
    return (
      <div className="community-empty">
        {back}
        <h1>Story unavailable</h1>
        <p>This link may be incorrect, or the content is no longer published.</p>
      </div>
    );
  }
  const related = stories.filter((s) => s.id !== story.id && s.track === story.track).slice(0, 3);
  const topicSections: Array<[StoryTopicKey, string, string | undefined]> = [
    ['experience', 'Journey Overview', story.experience],
    ['challenges', 'Challenges and Growth', story.challenges],
    ['skills', 'Skills Developed', story.skills],
    ['careerExperience', 'Career Experience', story.careerExperience],
    ['lessons', 'Lessons Learned', story.lessons],
    ['advice', 'Advise to Fellow Students', story.advice],
  ];

  return (
    <div className="community-page">
      {back}
      <article className={`community-detail gem-category-${story.track}`}>
        <div className="community-detail-header">
          <div className="community-detail-kicker">
            <span className="community-tag">
              <TrackTagLogo track={story.track} />
              <span>{CATEGORY_NAMES[story.track]}</span>
            </span>
            {story.publishedAt && <span className="community-date">Published {displayDate(story.publishedAt)}</span>}
          </div>
          <h1>{story.title}</h1>
          <AlumniIdentity story={story} size="lg" />
          {story.positions && story.positions.length > 0 && (
            <div className="community-positions community-positions--detail">
              <span className="community-positions-label">Positions held</span>
              <ul className="community-positions-list">
                {story.positions.map((pos) => (
                  <li key={pos}>{pos}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {story.quote && (
          <blockquote className="community-quote community-quote--detail">
            <svg
              width="28"
              height="22"
              viewBox="0 0 28 22"
              fill="none"
              aria-hidden="true"
              className="community-quote-mark"
            >
              <path
                d="M11.6 1.5C6.4 3.4 3 7.6 3 13.3C3 17.5 5.6 20.5 9.1 20.5C12.2 20.5 14.5 18.3 14.5 15.3C14.5 12.5 12.4 10.4 9.7 10.4C8.8 10.4 8 10.6 7.4 11C7.9 8.1 9.8 5.6 12.7 4.2L11.6 1.5ZM24.5 1.5C19.3 3.4 15.9 7.6 15.9 13.3C15.9 17.5 18.5 20.5 22 20.5C25.1 20.5 27.4 18.3 27.4 15.3C27.4 12.5 25.3 10.4 22.6 10.4C21.7 10.4 20.9 10.6 20.3 11C20.8 8.1 22.7 5.6 25.6 4.2L24.5 1.5Z"
                fill="currentColor"
              />
            </svg>
            <p>“{story.quote}”</p>
          </blockquote>
        )}

        {topicSections.map(([key, title, text]) =>
          text ? (
            <section key={key} className="community-story-section">
              <h2 className="community-topic-heading">
                <span className="community-topic-icon" aria-hidden="true">
                  <StoryTopicIcon topic={key} />
                </span>
                <span>{title}</span>
              </h2>
              <div className="community-prose-group">
                {text
                  .split(/\n\s*\n/)
                  .map((paragraph, index) => (
                    <p key={index} className="community-prose">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </section>
          ) : null,
        )}

        {story.editorialSummary && (
          <aside className="community-editorial">
            <h2>Editorial summary</h2>
            <p>{story.editorialSummary}</p>
          </aside>
        )}

        <footer className="community-detail-footer">
          <span className="community-verified-note">
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>Verified for publication</span>
          </span>
          <Link to={`/tracks?track=${story.track}`} className="community-text-link">
            Explore {CATEGORY_NAMES[story.track]}
            <ArrowUpRight size={15} />
          </Link>
        </footer>
      </article>
      {related.length > 0 && (
        <section>
          <h2 className="community-subheading">More journeys from this track</h2>
          <div className="community-grid">
            {related.map((s) => (
              <AlumniStoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
