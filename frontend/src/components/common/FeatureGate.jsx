import {
  useSiteSettings,
} from "../../context/SiteSettingsContext";

import FeatureUnavailablePage from "../../pages/FeatureUnavailablePage";

const FeatureGate = ({
  feature,
  title,
  description,
  children,
}) => {
  const {
    settings,
  } = useSiteSettings();

  const isEnabled =
    settings.features[
      feature
    ] !== false;

  if (!isEnabled) {
    return (
      <FeatureUnavailablePage
        title={title}
        description={
          description
        }
      />
    );
  }

  return children;
};

export default FeatureGate;