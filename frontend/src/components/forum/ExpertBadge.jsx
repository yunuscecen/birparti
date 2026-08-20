import {
  BadgeCheck,
} from "lucide-react";

const ExpertBadge = ({
  profile,
  compact = false,
}) => {
  if (!profile?.isVerified) {
    return null;
  }

  const label =
    profile.title ||
    "Doğrulanmış Uzman";

  const description = [
    label,
    profile.area,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      className={`forum-expert-badge ${
        compact
          ? "forum-expert-badge--compact"
          : ""
      }`}
      title={description}
    >
      <BadgeCheck
        size={compact ? 13 : 15}
      />

      <span>{label}</span>
    </span>
  );
};

export default ExpertBadge;