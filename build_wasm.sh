emsdk_dir=external/emsdk
opencv_dir=external/opencv
build_py=${opencv_dir}/platforms/js/build_js.py
build_wasm_dir=${opencv_dir}/build_wasm
build_simd_dir=${opencv_dir}/build_simd
build_threads_dir=${opencv_dir}/build_threads
build_threaded_simd_dir=${opencv_dir}/build_threaded-simd
options=(
  --build_wasm
  --cmake_option="-DBUILD_LIST=core,imgproc,js"
  --build_flags="-sEXPORT_ES6=1 -sMODULARIZE=1 -sENVIRONMENT=web,worker"
  --disable_single_file
  --opencv_dir ${opencv_dir}
  --emscripten_dir ${emsdk_dir}/upstream/emscripten
)

source ${emsdk_dir}/emsdk_env.sh

rm -rf ${build_wasm_dir}/bin/*
python ${build_py} ${build_wasm_dir} "${options[@]}"

rm -rf ${build_simd_dir}/bin/*
python ${build_py} ${build_simd_dir} "${options[@]}" --simd

rm -rf ${build_threads_dir}/bin/*
python ${build_py} ${build_threads_dir} "${options[@]}" --threads

rm -rf ${build_threaded_simd_dir}/bin/*
python ${build_py} ${build_threaded_simd_dir} "${options[@]}" --simd --threads
