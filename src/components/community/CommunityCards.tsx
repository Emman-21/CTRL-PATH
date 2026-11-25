import { Link } from 'react-router-dom';
import { UserRound, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AlumniStory } from '../../types/community';
import { CATEGORY_NAMES } from '../../utils/achievementRules';
import { safeExternalLink } from '../../utils/communitySelectors';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../shared/PixelArt';

export function TrackTagLogo({ track }: { track: AlumniStory['track'] }) {
  if (track === 'NT') return <NtTrackBadge size={20} className="shrink-0 rounded-md" />;
  if (track === 'BA') return <BaTrackBadge size={20} className="shrink-0 rounded-md" />;
  return <SmTrackBadge size={20} className="shrink-0 rounded-md" />;
}

export function AlumniIdentity({
  story,
  size = 'md',
}: {
  story: AlumniStory;
  size?: 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [story.profileImage]);
  const hasPositions = Boolean(story.positions && story.positions.length > 0);
  return (
    <div className={`community-identity ${size === 'lg' ? 'community-identity--lg' : ''}`}>
      {story.profileImage && !failed ? (
        <img
          src={story.profileImage}
          alt={`${story.displayName || 'Alumni contributor'} portrait`}
          onError={() => setFailed(true)}
          loading={size === 'lg' ? 'eager' : 'lazy'}
        />
      ) : (
        <span className="neutral-avatar">
          <UserRound aria-hidden="true" />
        </span>
      )}
      <div>
        <strong>{story.displayName || 'Alumni contributor'}</strong>
        {!hasPositions && story.currentRole && <p className="community-identity-role">{story.currentRole}</p>}
        {!hasPositions && story.organization && <p>{story.organization}</p>}
        {story.graduationYear && <p>Class of {story.graduationYear}</p>}
      </div>
    </div>
  );
}

export function AlumniStoryCard({
  story,
  variant = 'card',
}: {
  story: AlumniStory;
  variant?: 'card' | 'spotlight';
}) {
  const detailPath = `/alumni/${encodeURIComponent(story.id)}`;
  const hasFullStory = Boolean(
    story.experience ||
      story.challenges ||
      story.lessons ||
      story.skills ||
      story.careerExperience ||
      story.advice,
  );

  if (variant === 'spotlight') {
    return (
      <article className={`community-card community-spotlight gem-category-${story.track}`}>
        <aside className="community-spotlight-profile">
          <div className="community-spotlight-portrait">
            {story.profileImage ? (
              <img
                src={story.profileImage}
                alt={`${story.displayName || 'Alumni contributor'} portrait`}
                loading="eager"
              />
            ) : (
              <span className="neutral-avatar">
                <UserRound aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="community-spotlight-meta">
            <h3>{story.displayName || 'Alumni contributor'}</h3>
            {!(story.positions && story.positions.length > 0) && story.currentRole && (
              <p className="community-identity-role">{story.currentRole}</p>
            )}
            {!(story.positions && story.positions.length > 0) && story.organization && <p>{story.organization}</p>}
            {story.graduationYear && <p>Class of {story.graduationYear}</p>}
            <span className="community-tag">
              <TrackTagLogo track={story.track} />
              <span>{CATEGORY_NAMES[story.track]}</span>
            </span>
          </div>
        </aside>

        <div className="community-spotlight-body">
          {story.quote && (
            <blockquote className="community-quote community-quote--spotlight">
              <p>“{story.quote}”</p>
            </blockquote>
          )}

          {story.positions && story.positions.length > 0 && (
            <div className="community-positions">
              <span className="community-positions-label">Positions held</span>
              <ul className="community-positions-list">
                {story.positions.map((pos) => (
                  <li key={pos}>{pos}</li>
                ))}
              </ul>
            </div>
          )}

          {hasFullStory && (
            <div className="community-spotlight-footer">
              <Link className="community-text-link" to={detailPath}>
                Open full story view <span className="sr-only">{story.title}</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={`community-card gem-category-${story.track}`}>
      <span className="community-tag">{CATEGORY_NAMES[story.track]}</span>
      <h3>
        <Link to={detailPath}>{story.title}</Link>
      </h3>
      {story.quote && (
        <blockquote className="community-quote community-quote--compact">
          <p>“{story.quote}”</p>
        </blockquote>
      )}
      {story.excerpt && <p>{story.excerpt}</p>}
      <AlumniIdentity story={story} />
      {hasFullStory && (
        <Link className="community-text-link" to={detailPath}>
          Read story <span className="sr-only">{story.title}</span>
          <ArrowUpRight size={15} />
        </Link>
      )}
    </article>
  );
}

export function SourceLink({ url }: { url?: string }) {
  const safe = safeExternalLink(url);
  return safe ? (
    <a href={safe} target="_blank" rel="noopener noreferrer" className="community-text-link">
      Visit source <ArrowUpRight size={15} />
      <span className="sr-only">Opens in a new tab</span>
    </a>
  ) : null;
}
