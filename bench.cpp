#include <algorithm>
#include <cxxopts.hpp>
#include <iomanip>
#include <iostream>
#include <opencv2/opencv.hpp>
#include <string>
#include <vector>

int blurSize = 11;

int test_split(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  std::vector<cv::Mat> channels;
  int64 t1 = cv::getTickCount();
  cv::split(src, channels);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;

  return 0;
}

int test_LUT(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat lut(1, 256, CV_8UC1);
  for (int i = 0; i < 256; ++i) {
    lut.at<uchar>(i) = 255 - i;
  }

  int64 t1 = cv::getTickCount();
  cv::LUT(src, lut, src);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_adaptiveThreshold(const std::string &input) {
  cv::Mat src = cv::imread(input, cv::IMREAD_GRAYSCALE);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  int64 t1 = cv::getTickCount();
  cv::adaptiveThreshold(
      src, src, 255,
      cv::ADAPTIVE_THRESH_MEAN_C, // cv::ADAPTIVE_THRESH_GAUSSIAN_C
      cv::THRESH_BINARY,
      11, // blockSize
      2   // C
  );
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_blur(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  int64 t1 = cv::getTickCount();
  cv::blur(src, src, cv::Size(blurSize, blurSize), cv::Point(-1, -1),
           cv::BORDER_DEFAULT);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_Canny(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat gray, edges;
  cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);

  int64 t1 = cv::getTickCount();
  cv::Canny(gray, edges, 50, 150);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_cvtColor(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat gray;
  int64 t1 = cv::getTickCount();
  cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_boxFilter(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  int64 t1 = cv::getTickCount();
  cv::boxFilter(src, src, -1, cv::Size(blurSize, blurSize), cv::Point(-1, -1),
                true, cv::BORDER_DEFAULT);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_dilate(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));

  int64 t1 = cv::getTickCount();
  cv::dilate(src, src, kernel);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_erode(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(3, 3));

  int64 t1 = cv::getTickCount();
  cv::erode(src, src, kernel);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_findContours(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat gray, binary;
  cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);
  cv::threshold(gray, binary, 127, 255, cv::THRESH_BINARY);

  std::vector<std::vector<cv::Point>> contours;
  std::vector<cv::Vec4i> hierarchy;

  int64 t1 = cv::getTickCount();
  cv::findContours(binary, contours, hierarchy, cv::RETR_EXTERNAL,
                   cv::CHAIN_APPROX_SIMPLE);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_GaussianBlur(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  int64 t1 = cv::getTickCount();
  cv::GaussianBlur(src, src, cv::Size(blurSize, blurSize), 0);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_resize(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  cv::Mat dst;

  int64 t1 = cv::getTickCount();
  cv::resize(src, dst, cv::Size(2000, 2000), 0, 0, cv::INTER_LINEAR);
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

int test_stackBlur(const std::string &input) {
  cv::Mat src = cv::imread(input);
  if (src.empty()) {
    std::cerr << "Failed to load image: " << input << std::endl;
    return 1;
  }

  int64 t1 = cv::getTickCount();
  cv::blur(src, src, cv::Size(blurSize, blurSize));
  int64 t2 = cv::getTickCount();

  double elapsed_ms = (t2 - t1) * 1000.0 / cv::getTickFrequency();
  std::cout << std::fixed << std::setprecision(3) << elapsed_ms << std::endl;
  return 0;
}

const std::unordered_map<std::string, std::function<int(const std::string &)>>
    task_map = {
        {"split", test_split},
        {"LUT", test_LUT},
        {"adaptiveThreshold", test_adaptiveThreshold},
        {"blur", test_blur},
        {"Canny", test_Canny},
        {"cvtColor", test_cvtColor},
        {"boxFilter", test_boxFilter},
        {"dilate", test_dilate},
        {"erode", test_erode},
        {"findContours", test_findContours},
        {"GaussianBlur", test_GaussianBlur},
        {"resize", test_resize},
        {"stackBlur", test_stackBlur},
};

int main(int argc, char *argv[]) {
  cxxopts::Options options("opencvjs-bench", "A benchmark of opencv.js.");
  options.add_options()("h,help", "Print help")("V,version", "Show version")(
      "task", "Task to run: resize", cxxopts::value<std::string>())(
      "file", "Path to input file", cxxopts::value<std::string>());
  options.parse_positional({"task", "file"});
  options.positional_help("[task] [file]");
  auto result = options.parse(argc, argv);

  if (result.count("help")) {
    std::cout << options.help() << std::endl;
    return 0;
  }
  if (result.count("version")) {
    std::cout << "0.0.1\n";
    return 0;
  }
  if (!result.count("task") || !result.count("file")) {
    std::cerr << "Error: Missing required arguments\n";
    return 1;
  }

  std::string task = result["task"].as<std::string>();
  std::string file = result["file"].as<std::string>();

  auto it = task_map.find(task);
  if (it != task_map.end()) {
    return it->second(file);
  } else {
    std::cerr << "Error: Invalid task '" << task << "'\n";
    return 1;
  }
  return 0;
}
