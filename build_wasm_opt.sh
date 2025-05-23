set -e

emsdk_dir=external/emsdk
opencv_dir=external/opencv
build_py=${opencv_dir}/platforms/js/build_js.py

declare -A opt_flags=(
  [O1]="-O1"
  [O2]="-O2"
  [O3]="-O3"
  [Ofast]="-Ofast"
  [Os]="-Os"
)
options=(
  --build_wasm
  --cmake_option="-DBUILD_LIST=core,imgproc,js"
  --disable_single_file
  --opencv_dir "${opencv_dir}"
  --emscripten_dir "${emsdk_dir}/upstream/emscripten"
  --simd
  --threads
)

source "${emsdk_dir}/emsdk_env.sh"

for opt in "${!opt_flags[@]}"; do
  build_dir="build/wasm_${opt}"
  python "${build_py}" "${build_dir}" \
    "${options[@]}" \
    --cmake_option="-DCMAKE_C_FLAGS_RELEASE='${opt_flags[$opt]} -DNDEBUG -DNDEBUG'" \
    --cmake_option="-DCMAKE_CXX_FLAGS_RELEASE='${opt_flags[$opt]} -DNDEBUG -DNDEBUG'" \
    --build_flags="-sEXPORT_ES6=1 -sMODULARIZE=1 -sENVIRONMENT=web,worker"
done
