# input_controller.py to handle mouse and keyboard events
import pyautogui

SCREEN_SIZE = pyautogui.size()

def handle_click(rel_x, rel_y, action='click'):
    absolute_x = int(rel_x * SCREEN_SIZE.width)
    absolute_y = int(rel_y * SCREEN_SIZE.height)
    pyautogui.moveTo(absolute_x, absolute_y)
    
    if action == 'double_click':
        pyautogui.doubleClick()
    elif action == 'right_click':
        pyautogui.rightClick()
    else:
        pyautogui.click()


def handle_move(rel_x, rel_y):
    absolute_x = int(rel_x * SCREEN_SIZE.width)
    absolute_y = int(rel_y * SCREEN_SIZE.height)
    pyautogui.moveTo(absolute_x, absolute_y)

def handle_key(key, action='press'):
    if action == 'down':
        pyautogui.keyDown(key)
    elif action == 'up':
        pyautogui.keyUp(key)
    else:
        pyautogui.press(key)


def handle_scroll(rel_y):
    pyautogui.scroll(rel_y)
