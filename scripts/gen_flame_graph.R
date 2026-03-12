library(ggplot2)

# Flame graph data: each row is a rectangle
# xmin/xmax = time span, ymin/ymax = stack depth
# The total width is 1.0 (100% of time)

frames <- data.frame(
  label = c(
    # Bottom: slow_analysis spans everything
    "slow_analysis",
    # Level 1: grow_vector (left ~45%) and lm (right ~55%)
    "grow_vector", "lm",
    # Level 2 under grow_vector: c()
    "c",
    # Level 2 under lm: eval
    "eval",
    # Level 3 under lm > eval: stats::model.frame (~35%) and lm.fit (~12%)
    "stats::model.frame", "lm.fit",
    # Level 4 under model.frame: model.frame.default
    "model.frame.default",
    # Level 5 under model.frame.default: is.data.frame (~18%) + na.omit (~8%)
    "is.data.frame", "na.omit",
    # Level 6 under na.omit: na.omit.data.frame
    "na.omit.data.frame",
    # Level 6 under is.data.frame: [.data.frame
    "[.data.frame",
    # Level 7 under [.data.frame: make.unique
    "make.unique"
  ),
  xmin = c(
    0.00,          # slow_analysis
    0.00, 0.45,    # grow_vector, lm
    0.00,          # c
    0.45,          # eval
    0.45, 0.87,    # model.frame, lm.fit
    0.45,          # model.frame.default
    0.55, 0.45,    # is.data.frame, na.omit
    0.45,          # na.omit.data.frame
    0.55,          # [.data.frame
    0.60           # make.unique
  ),
  xmax = c(
    1.00,          # slow_analysis
    0.45, 1.00,    # grow_vector, lm
    0.45,          # c
    0.98,          # eval
    0.85, 0.98,    # model.frame, lm.fit
    0.85,          # model.frame.default
    0.85, 0.55,    # is.data.frame, na.omit
    0.55,          # na.omit.data.frame
    0.85,          # [.data.frame
    0.85           # make.unique
  ),
  ymin = c(
    0,             # slow_analysis
    1, 1,          # grow_vector, lm
    2,             # c
    2,             # eval
    3, 3,          # model.frame, lm.fit
    4,             # model.frame.default
    5, 5,          # is.data.frame, na.omit
    6,             # na.omit.data.frame
    6,             # [.data.frame
    7              # make.unique
  ),
  ymax = c(
    1,
    2, 2,
    3,
    3,
    4, 4,
    5,
    6, 6,
    7,
    7,
    8
  ),
  stringsAsFactors = FALSE
)

# Color palette: warm tones like profvis
# Left stack (c/grow_vector) = reds, right stack (lm) = oranges
frames$width <- frames$xmax - frames$xmin

frames$fill <- c(
  "#E8601C",  # slow_analysis - dark orange
  "#CC4411",  # grow_vector - red
  "#E8751C",  # lm - orange
  "#DD3300",  # c - bright red
  "#E88A1C",  # eval - light orange
  "#E8751C",  # model.frame - orange
  "#C8B830",  # lm.fit - olive
  "#E8901C",  # model.frame.default - warm orange
  "#E8A830",  # is.data.frame - yellow-orange
  "#DD5544",  # na.omit - salmon
  "#DD6655",  # na.omit.data.frame - light salmon
  "#E8A830",  # [.data.frame - yellow-orange
  "#E8B840"   # make.unique - yellow
)

# Hide labels that would overflow: ratio of box width to label length
frames$chars <- nchar(frames$label)
frames$density <- frames$width / frames$chars
# Threshold: ~0.012 units per character at font size 3.0 on a 10-inch plot
frames$show_label <- ifelse(frames$density >= 0.011, frames$label, "")

# Font size: scale down for narrower boxes
frames$fontsize <- ifelse(frames$width >= 0.30, 3.8,
                   ifelse(frames$width >= 0.20, 3.4,
                   ifelse(frames$width >= 0.10, 3.0, 2.6)))

p <- ggplot(frames) +

geom_rect(
    aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = frames$fill,
    color = "white",
    linewidth = 0.5
  ) +
  geom_text(
    aes(
      x = (xmin + xmax) / 2,
      y = (ymin + ymax) / 2,
      label = show_label
    ),
    size = frames$fontsize,
    color = "grey10",
    fontface = "plain"
  ) +
  labs(title = expression(
    paste("Flame graph: ", italic("slow_analysis"), "()")
  )) +
  scale_x_continuous(expand = c(0, 0)) +
  scale_y_continuous(expand = c(0, 0.2)) +
  theme_void(base_size = 12) +
  theme(
    plot.title = element_text(hjust = 0.5, size = 16, face = "bold",
                              margin = margin(b = 10)),
    plot.margin = margin(15, 10, 5, 10),
    plot.background = element_rect(fill = "white", color = NA)
  )

ggsave(
  here::here("images", "flame_graph.png"),
  plot = p,
  width = 10,
  height = 5,
  dpi = 200,
  bg = "white"
)

cat("Done: images/flame_graph.png\n")
