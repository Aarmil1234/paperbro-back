const supabase = require("../../config/supabase");

exports.createSubject = async (req, res) => {
  try {
    const { name, code } =
      req.body;

    const { data, error } =
      await supabase
        .from("subjects")
        .insert([
          {
            name,
            code,
          },
        ])
        .select()
        .single();

    if (error) throw error;

    res.json({
      success: true,
      subject: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getSubjects = async (
  req,
  res
) => {
  try {
    const { data, error } =
      await supabase
        .from("subjects")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    res.json({
      success: true,
      subjects: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteSubject = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { error } =
      await supabase
        .from("subjects")
        .delete()
        .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};