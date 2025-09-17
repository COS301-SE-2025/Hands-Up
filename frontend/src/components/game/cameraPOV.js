import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import PropTypes from 'prop-types';

export default function CameraPOV({
  laptopPos = [0, 5, 58],
  mobilePos = [0, 5, 62],
  laptopRot = [-0.2, 0, 0],
  mobileRot = [-0.25, 0, 0],
  fovLaptop = 50,
  fovMobile = 95
}) {
  const { camera } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      camera.position.set(...mobilePos);
      camera.rotation.set(...mobileRot);
      camera.fov = fovMobile;
    } else {
      camera.position.set(...laptopPos);
      camera.rotation.set(...laptopRot);
      camera.fov = fovLaptop;
    }
    camera.updateProjectionMatrix();
  }, [isMobile, camera, laptopPos, mobilePos, laptopRot, mobileRot, fovLaptop, fovMobile]);

  return null;
}

CameraPOV.propTypes = {
  laptopPos: PropTypes.arrayOf(PropTypes.number),
  mobilePos: PropTypes.arrayOf(PropTypes.number),
  laptopRot: PropTypes.arrayOf(PropTypes.number),
  mobileRot: PropTypes.arrayOf(PropTypes.number),
  fovLaptop: PropTypes.number,
  fovMobile: PropTypes.number,
};

CameraPOV.defaultProps = {
  laptopPos: [0, 5, 58],
  mobilePos: [0, 6, 50],
  laptopRot: [-0.2, 0, 0],
  mobileRot: [-0.25, 0, 0],
  fovLaptop: 50,
  fovMobile: 60,
};