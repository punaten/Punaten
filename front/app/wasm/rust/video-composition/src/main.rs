extern crate image;

use image::ImageBuffer;
use std::slice;

#[no_mangle]
pub extern "C" fn chromaKeyCompositing(
    foreground_data: *mut u8, 
    background_data: *const u8, 
    width: u32, 
    height: u32, 
    data_len: usize // data_lenは画像データのバイト数
) -> *mut u8 {
    // 安全なスライスへの変換
    let foreground_slice = unsafe { slice::from_raw_parts_mut(foreground_data, data_len) };
    let background_slice = unsafe { slice::from_raw_parts(background_data, data_len) };

    let mut foreground_img =
        ImageBuffer::from_raw(width, height, foreground_slice.to_vec()).unwrap();
    let background_img =
        ImageBuffer::from_raw(width, height, background_slice.to_vec()).unwrap();

    // クロマキー合成
    for (x, y, pixel) in foreground_img.enumerate_pixels_mut() {
        let foreground_pixel: image::Rgba<u8> = *pixel;
        let is_green =
            foreground_pixel[1] > 200 && foreground_pixel[0] < 50 && foreground_pixel[2] < 50;

        if is_green {
            *pixel = *background_img.get_pixel(x, y);
        }
    }

    let mut merged_data = foreground_img.into_raw();
    merged_data.as_mut_ptr()
}

fn main() {
    println!("Hello, world!");
}
