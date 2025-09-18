import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import PropTypes from 'prop-types';

export default function CameraPOV({
  laptopPos = [0, 5, 58],
  tabletPos = [0, 5, 60],
  mobilePos = [0, 5, 62],
  laptopRot = [-0.2, 0, 0],
  tabletRot = [-0.225, 0, 0],
  mobileRot = [-0.25, 0, 0],
  fovLaptop = 50,
  fovTablet = 72.5,
  fovMobile = 95
}) {
  const { camera } = useThree();
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width <= 768) setDevice('mobile');
      else if (width <= 1836) setDevice('tablet');
      else setDevice('desktop');
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (device === 'mobile') {
      camera.position.set(...mobilePos);
      camera.rotation.set(...mobileRot);
      camera.fov = fovMobile;
    } else if (device === 'tablet') {
      camera.position.set(...tabletPos);
      camera.rotation.set(...tabletRot);
      camera.fov = fovTablet;
    } else {
      camera.position.set(...laptopPos);
      camera.rotation.set(...laptopRot);
      camera.fov = fovLaptop;
    }
    camera.updateProjectionMatrix();
  }, [device, camera, laptopPos, tabletPos, mobilePos, laptopRot, tabletRot, mobileRot, fovLaptop, fovTablet, fovMobile]);

  return null;
}

CameraPOV.propTypes = {
  laptopPos: PropTypes.arrayOf(PropTypes.number),
  tabletPos: PropTypes.arrayOf(PropTypes.number),
  mobilePos: PropTypes.arrayOf(PropTypes.number),
  laptopRot: PropTypes.arrayOf(PropTypes.number),
  tabletRot: PropTypes.arrayOf(PropTypes.number),
  mobileRot: PropTypes.arrayOf(PropTypes.number),
  fovLaptop: PropTypes.number,
  fovTablet: PropTypes.number,
  fovMobile: PropTypes.number,
};

CameraPOV.defaultProps = {
  laptopPos: [0, 5, 58],
  tabletPos: [0, 5, 60],
  mobilePos: [0, 6, 50],
  laptopRot: [-0.2, 0, 0],
  tabletRot: [-0.22, 0, 0],
  mobileRot: [-0.25, 0, 0],
  fovLaptop: 50,
  fovTablet: 70,
  fovMobile: 60,
};