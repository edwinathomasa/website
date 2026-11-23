import { memo } from 'react';
import { STRINGS } from '../../constants/strings';
import type { Experience } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import GlassTag from '../atoms/GlassTag';
import PeriodBadge from '../atoms/PeriodBadge';

export interface ExperienceTimelineCardProps {
  readonly experience: Experience;
}

const ExperienceTimelineCard = memo(function ExperienceTimelineCard({
  experience,
}: ExperienceTimelineCardProps) {
  return (
    <GlassSlab as="article" layer={2} className="glass-subcard timeline-card">
      <div className="timeline-card-header">
        <div>
          <h3 className="timeline-role">{experience.role}</h3>
          <p className="timeline-company">
            {experience.company}
            {experience.client ? ` · Client: ${experience.client}` : ''}
            {experience.location ? ` · ${experience.location}` : ''}
          </p>
        </div>
        <PeriodBadge text={experience.period} />
      </div>

      <p className="timeline-overview">{experience.description}</p>

      {experience.highlights && experience.highlights.length > 0 && (
        <ul className="timeline-bullets">
          {experience.highlights.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}

      {experience.tools && experience.tools.length > 0 && (
        <div className="timeline-tools-row depth-recessed">
          <span className="tools-label">{STRINGS.experience.toolsLabel}</span>
          <div className="tag-cloud">
            {experience.tools.map((tool) => (
              <GlassTag key={tool} label={tool} variant="sm" />
            ))}
          </div>
        </div>
      )}

      {experience.assignments && experience.assignments.length > 0 && (
        <div className="timeline-assignments">
          <span className="assignments-heading">
            Client Assignments ({experience.assignments.length})
          </span>
          {experience.assignments.map((assignment) => (
            <div
              key={`${assignment.client}-${assignment.period}`}
              className="assignment-card depth-recessed"
            >
              <div className="timeline-card-header">
                <div>
                  <h4 className="assignment-client">
                    {assignment.client}
                    <span className="assignment-role"> · {assignment.role}</span>
                  </h4>
                </div>
                <PeriodBadge text={assignment.period} />
              </div>

              <p className="timeline-overview">{assignment.description}</p>

              {assignment.highlights && assignment.highlights.length > 0 && (
                <ul className="timeline-bullets">
                  {assignment.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}

              {assignment.tools && assignment.tools.length > 0 && (
                <div className="tag-cloud">
                  {assignment.tools.map((tool) => (
                    <GlassTag key={tool} label={tool} variant="sm" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassSlab>
  );
});

export default ExperienceTimelineCard;
