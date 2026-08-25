export default function TrainingViewerFrame({ children }: { children: any }) {
  return (
    <div
      style={{
        marginTop: "20px",
        width: "100%",
        maxWidth: "900px",
        height: "60vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: "12px",
        background: "#000",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {children}
    </div>
  );
}
