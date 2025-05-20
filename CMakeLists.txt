cmake_minimum_required(VERSION 3.22.1)
project(OpenCVJsBench)

find_package(OpenCV REQUIRED)

add_executable(bench bench.cpp)
target_include_directories(bench PRIVATE external/cxxopts/include)
target_link_libraries(bench PRIVATE ${OpenCV_LIBS})
