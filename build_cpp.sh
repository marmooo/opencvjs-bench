set -e

base_dir=$(pwd)
opencv_dir=${base_dir}/external/opencv

declare -A opt_flags=(
  [O1]="-O1"
  [O2]="-O2"
  [O3]="-O3"
  [Ofast]="-Ofast"
  [Os]="-Os"
)

for opt in "${!opt_flags[@]}"; do
  opencv_build="${base_dir}/build/opencv_${opt}"
  build_dir="${base_dir}/build/cpp_${opt}"
  mkdir -p "$build_dir"
  cd "$build_dir"
  cmake "${base_dir}" -DOpenCV_DIR="$opencv_build"
  make -j"$(nproc)"
  cd ..
done
