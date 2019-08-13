
import numpy
import cv2
import screeninfo


def get_monitor_position(monitor_id):
    """Retrieves the monitor start coordinates as a tuple (x, y). """
    monitors = screeninfo.get_monitors()
    if monitor_id > len(monitors)-1:
        monitor_id = len(monitors)-1
    elif monitor_id < 0:
        monitor_id = 0

    return monitors[monitor_id].x, monitors[monitor_id].y


def create_blank_image(width, height):
    """Create new image(numpy array) filled with certain color in RGB."""
    # Create black blank image
    return numpy.zeros(shape=[width, height, 3], dtype=numpy.uint8)


def clear_window(window_name):
    # Create black image
    (_, _, width, height) = cv2.getWindowImageRect(window_name)
    cv2.imshow(window_name, create_blank_image(width, height))

    # Make sure everything is displayed to the screen
    cv2.waitKey(1)


def prepare_window(window_name, monitor_index=2):
    """Prepares window with the given name. Sets a black background."""
    # Create window
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)

    # Move to correct monitor
    monitor_x, monitor_y = get_monitor_position(monitor_index-1)
    cv2.moveWindow(window_name, monitor_x, monitor_y)

    # Always use full screen
    cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

    # Set black background to begin with
    clear_window(window_name)


def remove_window(window_name):
    """Destroys window with the given name."""
    cv2.destroyWindow(window_name)


def remove_all_windows():
    """Destroys all opened windows."""
    cv2.destroyAllWindows()
