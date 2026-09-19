const router =
  require("express").Router();

const {
  getDashboardStats,
  getDashboardCharts,
} = require("./dashboard.controller");

router.get(
  "/",
  getDashboardStats
);

router.get(
  "/charts",
  getDashboardCharts
);

module.exports = router;