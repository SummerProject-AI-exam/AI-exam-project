export default function TrainingViewerFrame({ children }: { children: any }) {
  return (
    <div
      style={{
        marginTop: "20px",
        width: 640,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}
