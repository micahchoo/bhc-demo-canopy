const { getLabel } = require("../iiif/label");

exports.buildIndexData = (items) => {
  return items.map((item) => {
    const { index, label, summary, metadata } = item;
    return {
      id: index,
      label: typeof label === 'string' ? label : getLabel(label).join(" "),
      summary: typeof summary === 'string' ? summary : getLabel(summary).join(" "),
      metadata: metadata
        ? metadata
            .map((entry) => entry.value)
            .join(" ")
        : "",
    };
  });
};
