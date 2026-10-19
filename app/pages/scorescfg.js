var S3CFG = {
  max: { technical: 4, sentiment: 4, macro: 22, growth: 6, inflation: 8, jobs: 8 },
  strong: 0.5,
  mild: 0.15
};
var S3G = [["technical", "Tech"], ["sentiment", "Sent"], ["macro", "Macro"], ["growth", "Growth"], ["inflation", "Infl"], ["jobs", "Jobs"]];
var s3k = "abs", s3d = -1, s3h = false;
