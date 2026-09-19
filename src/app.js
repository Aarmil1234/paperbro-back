const express = require("express");
const cors = require("cors");

const subjectRoutes = require(
  "./modules/subjects/subject.routes"
);

const paperRoutes = require(
  "./modules/papers/paper.routes"
);

const testRoutes = require(
  "./modules/test/test.routes"
);

const paperAnalysisRoutes =
  require(
    "./modules/papers/paper-analysis.routes"
  );

  const predictionRoutes =
  require(
    "./modules/predictions/prediction.routes"
  );

  const dashboardRoutes =
  require(
    "./modules/dashboard/dashboard.routes"
  );

  
  
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  app.use(
    "/api/dashboard",
    dashboardRoutes
  );
  
app.use(
  "/api/subjects",
  subjectRoutes
);

app.use(
  "/api/papers",
  paperRoutes
);

app.use(
  "/api/test",
  testRoutes
);

app.use(
  "/api/papers/analyze",
  paperAnalysisRoutes
);

app.use(
  "/api/predictions",
  predictionRoutes
);


app.get("/", (_, res) => {
  res.json({
    message: "PaperRadar API Running",
  });
});

module.exports = app;