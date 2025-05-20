emsdk_dir=external/emsdk
opencv_dir=external/opencv
build_py=${opencv_dir}/platforms/js/build_js.py
build_js_dir=${opencv_dir}/build_js
options=(
  --disable_wasm
  --cmake_option="-DBUILD_LIST=core,imgproc,js"
  --build_flags="-sEXPORT_ES6=1 -sMODULARIZE=1 -sENVIRONMENT=web,worker"
  --disable_single_file
  --opencv_dir ${opencv_dir}
  --emscripten_dir ${emsdk_dir}/upstream/emscripten
)

source ${emsdk_dir}/emsdk_env.sh

rm -rf ${build_js_dir}/bin/*
python ${build_py} ${build_js_dir} "${options[@]}"
