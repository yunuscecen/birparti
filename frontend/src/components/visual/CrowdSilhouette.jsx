const people = [
  { left: "1%", size: 92, opacity: 0.42, blur: 1 },
  { left: "7%", size: 66, opacity: 0.34, blur: 2 },
  { left: "12%", size: 120, opacity: 0.63, blur: 0 },
  { left: "19%", size: 78, opacity: 0.42, blur: 1 },
  { left: "25%", size: 108, opacity: 0.55, blur: 0 },
  { left: "33%", size: 70, opacity: 0.35, blur: 2 },
  { left: "39%", size: 132, opacity: 0.68, blur: 0 },
  { left: "47%", size: 86, opacity: 0.44, blur: 1 },
  { left: "54%", size: 118, opacity: 0.57, blur: 0 },
  { left: "62%", size: 73, opacity: 0.35, blur: 2 },
  { left: "68%", size: 126, opacity: 0.66, blur: 0 },
  { left: "76%", size: 82, opacity: 0.4, blur: 1 },
  { left: "82%", size: 112, opacity: 0.58, blur: 0 },
  { left: "90%", size: 72, opacity: 0.38, blur: 2 },
  { left: "95%", size: 104, opacity: 0.52, blur: 1 },
];

const CrowdSilhouette = () => {
  return (
    <div className="crowd-silhouette" aria-hidden="true">
      {people.map((person, index) => (
        <span
          key={`${person.left}-${index}`}
          className="crowd-silhouette__person"
          style={{
            "--person-left": person.left,
            "--person-size": `${person.size}px`,
            "--person-opacity": person.opacity,
            "--person-blur": `${person.blur}px`,
          }}
        />
      ))}
    </div>
  );
};

export default CrowdSilhouette;