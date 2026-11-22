export type StoryTopicKey =
  | 'experience'
  | 'challenges'
  | 'skills'
  | 'careerExperience'
  | 'lessons'
  | 'advice';

export function StoryTopicIcon({ topic }: { topic: StoryTopicKey }) {
  switch (topic) {
    case 'experience':
      // Journey Overview: Compass & winding horizon path
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="community-topic-svg"
        >
          <circle
            cx="12"
            cy="12"
            r="9.25"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeOpacity="0.35"
          />
          <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" strokeOpacity="0.55" />
          <path
            d="M15.6 8.4L13.5 13.5L8.4 15.6L10.5 10.5L15.6 8.4Z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="1.25" fill="currentColor" />
        </svg>
      );

    case 'challenges':
      // Challenges and Growth: Summit peak with rising path & milestone star
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="community-topic-svg"
        >
          <path
            d="M3.5 19L9.2 9.5L13 14.5L16 10.5L20.5 19H3.5Z"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 19C8.8 16.5 10.6 15.2 13 14.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 4.5L16.7 6.3L18.5 7L16.7 7.7L16 9.5L15.3 7.7L13.5 7L15.3 6.3L16 4.5Z"
            fill="currentColor"
          />
        </svg>
      );

    case 'advice':
      // Advise to Fellow Students: Guiding lantern / open book & rising spark
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="community-topic-svg"
        >
          <path
            d="M4.5 7.5C4.5 6.4 5.4 5.5 6.5 5.5H10.5C11.3 5.5 12 6.2 12 7V18.5C11.2 17.8 10.2 17.5 9 17.5H6.5C5.4 17.5 4.5 16.6 4.5 15.5V7.5Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 7.5C19.5 6.4 18.6 5.5 17.5 5.5H13.5C12.7 5.5 12 6.2 12 7V18.5C12.8 17.8 13.8 17.5 15 17.5H17.5C18.6 17.5 19.5 16.6 19.5 15.5V7.5Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 2.5V4M8.5 3.4L9.3 4.5M15.5 3.4L14.7 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'skills':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="community-topic-svg"
        >
          <path
            d="M12 3.5L19.5 7.8V16.2L12 20.5L4.5 16.2V7.8L12 3.5Z"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 12.2L11.2 14.2L15 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'careerExperience':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="community-topic-svg"
        >
          <rect
            x="3.5"
            y="7.5"
            width="17"
            height="12"
            rx="2.5"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M9 7.5V5.5C9 4.7 9.7 4 10.5 4H13.5C14.3 4 15 4.7 15 5.5V7.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M3.5 12.5H20.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.6" />
        </svg>
      );

    case 'lessons':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="community-topic-svg"
        >
          <path
            d="M12 3.5C8.7 3.5 6 6.2 6 9.5C6 11.7 7.2 13.6 9 14.6V16.5C9 17.3 9.7 18 10.5 18H13.5C14.3 18 15 17.3 15 16.5V14.6C16.8 13.6 18 11.7 18 9.5C18 6.2 15.3 3.5 12 3.5Z"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M10 20.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}
