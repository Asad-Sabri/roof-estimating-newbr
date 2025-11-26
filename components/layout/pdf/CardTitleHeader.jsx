// CardTitleHeader.jsx

const CardTitleHeader = ({ title }) => {
  const titleStyle = {
    margin: 0,
    padding: "10px 16px",
    color: "white",
  };

    const cardHeaderStyle = {
      backgroundColor: "#0f2346",
      padding: "0 10px 15px 10px",
      borderBottom: "1px solid #ccc",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#fff",
    };
  

  return (
    <div style={cardHeaderStyle}>
      <h3 style={titleStyle}>{title}</h3>
    </div>
  );
};

export default CardTitleHeader;
