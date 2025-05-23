base_dir=$(pwd)
opencv_dir=${base_dir}/external/opencv

set -e

declare -A opt_flags=(
  [O1]="-O1"
  [O2]="-O2"
  [O3]="-O3"
  [Ofast]="-Ofast"
  [Os]="-Os"
)

for opt in "${!opt_flags[@]}"; do
  cd "$base_dir"
  build_dir="build/opencv_${opt}"
  mkdir -p "$build_dir"
  cd "$build_dir"
  cmake "${opencv_dir}" \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_LIST=core,imgproc,imgcodecs \
    -DBUILD_SHARED_LIBS=ON \
    -DBUILD_TESTS=OFF \
    -DBUILD_PERF_TESTS=OFF \
    -DBUILD_DOCS=OFF \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_opencv_python=OFF \
    -DOPENCV_EXTRA_C_FLAGS="${opt_flags[$opt]}" \
    -DOPENCV_EXTRA_CXX_FLAGS="${opt_flags[$opt]}" \
    -DCPU_BASELINE=SSE4_1 \
    -DCPU_DISPATCH=SSE4_2,AVX,AVX2,AVX512,AVX512_SKX,FMA3,POPCNT \
    -DWITH_PTHREADS=ON \
    -DWITH_OPENMP=ON
  make -j"$(nproc)"
done
