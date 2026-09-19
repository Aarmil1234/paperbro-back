const supabase = require("../../config/supabase");

exports.getDashboardStats =
  async (req, res) => {
    try {
      const {
        count: totalSubjects,
      } = await supabase
        .from("subjects")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        count: totalPapers,
      } = await supabase
        .from("papers")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        count: totalQuestions,
      } = await supabase
        .from("questions")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        count: totalPredictions,
      } = await supabase
        .from("predictions")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        data: recentSubjects,
      } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      const {
        data: recentPapers,
      } = await supabase
        .from("papers")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      return res.json({
        success: true,
        totalSubjects,
        totalPapers,
        totalQuestions,
        totalPredictions,
        recentSubjects:
          recentSubjects || [],
        recentPapers:
          recentPapers || [],
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  exports.getDashboardCharts =
  async (req, res) => {
    try {

      // Subjects + Paper Count

      const { data: subjects } =
        await supabase
          .from("subjects")
          .select("*");

      const { data: papers } =
        await supabase
          .from("papers")
          .select("*");

      const papersPerSubject =
        subjects.map((subject) => ({
          subject: subject.name,
          papers:
            papers.filter(
              (p) =>
                p.subject_id ===
                subject.id
            ).length,
        }));

      // Top Topics

      const { data: questions } =
        await supabase
          .from("questions")
          .select("topic");

      const topicMap = {};

      questions?.forEach((q) => {
        const topic =
          q.topic ||
          "Unknown Topic";

        topicMap[topic] =
          (topicMap[topic] || 0) + 1;
      });

      const topTopics =
        Object.entries(topicMap)
          .map(
            ([topic, count]) => ({
              topic,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count - a.count
          )
          .slice(0, 10);

      return res.json({
        success: true,
        papersPerSubject,
        topTopics,
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };