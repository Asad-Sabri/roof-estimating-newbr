// layout/pdf/PDFDataProvider.ts
export const getPDFData = () => {
  const mapFeaturesData = JSON.parse(localStorage.getItem("mapFeaturesData") || "{}");
  const projectLocation = JSON.parse(localStorage.getItem("projectLocation") || "{}");

  return {
    polygons: mapFeaturesData.polygons || [],
    lines: mapFeaturesData.lines || [],
    projectLocation: projectLocation || { lat: 0, lng: 0 },
    date: new Date().toLocaleDateString(),
  };
};
