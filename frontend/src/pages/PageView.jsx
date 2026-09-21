import { Link } from 'react-router-dom';

const PAGE_CONTENT = {
  bids: {
    eyebrow: 'Workspace',
    title: 'Bids',
    description: 'Review bid packages and keep submission work aligned with tender requirements.',
    actions: [{ to: '/compliance', label: 'Check compliance' }],
  },
  compliance: {
    eyebrow: 'Intelligence',
    title: 'Compliance rules',
    description: 'Inspect the rules that validate documents and procurement decisions.',
    actions: [{ to: '/review', label: 'Review flagged cases' }],
  },
};

export default function PageView({ page }) {
  const content = PAGE_CONTENT[page];

  return (
    <section className="page-view" aria-labelledby={`${page}-title`}>
      <p className="page-view-eyebrow">{content.eyebrow}</p>
      <h2 id={`${page}-title`}>{content.title}</h2>
      <p className="page-view-description">{content.description}</p>
      <div className="page-view-actions">
        {content.actions.map((action) => (
          <Link key={action.to} className="page-view-action" to={action.to}>
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
