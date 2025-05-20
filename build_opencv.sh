opencv_dir=external/opencv
build_dir=${opencv_dir}/build

mkdir -p $build_dir
cd $build_dir
cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_LIST=core,imgproc,imgcodecs \
  -DBUILD_SHARED_LIBS=ON \
  -DBUILD_TESTS=OFF \
  -DBUILD_PERF_TESTS=OFF \
  -DBUILD_DOCS=OFF \
  -DBUILD_EXAMPLES=OFF \
  -DBUILD_opencv_python=OFF \
  -DCPU_BASELINE=SSE4_1 \
  -DCPU_DISPATCH=SSE4_2,AVX,AVX2,AVX512,AVX512_SKX,FMA3,POPCNT \
  -DWITH_PTHREADS=ON \
  -DWITH_OPENMP=ON
make -j$(nproc)
